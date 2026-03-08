import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Content } from '../data/mockData';
import { confirmPayment, initiateRental } from '../services/rentalService';
import RazorpayCheckout from 'react-native-razorpay';
import { logger } from '../utils/logger';
import type { RentalRecord } from '../types/api';
import { COLORS } from '../constants/colors';
import { ENV } from '../constants/env';

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, useNativeDriver: true }),
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = 'upi' | 'card' | 'wallet' | 'netbanking';

interface PaymentScreenProps {
  content: Content;
  onBack: () => void;
  onSuccess: (rental: RentalRecord) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PaymentScreen({ content, onBack, onSuccess }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [securityTip, setSecurityTip] = useState(false);

  const isValid = () => {
    return selectedMethod !== null;
  };

  const handlePay = async () => {
    if (!isValid() || processing || !selectedMethod) return;
    setProcessing(true);
    try {
      // Step 1: Create payment order on the server
      const order = await initiateRental({
        contentId: content.id,
        amountINR: content.price,
        currency: 'INR',
      });
      logger.info('PaymentScreen', 'Order created', { orderId: order.orderId, amount: order.amountINR ?? content.price });

      // Step 2: If mock mode OR mock order ID, skip Razorpay and confirm payment directly
      const isMockOrder = order.gatewayOrderId?.startsWith('mock_order_') || order.orderId?.startsWith('mock_');
      if (require('../services/apiClient').USE_MOCK || isMockOrder) {
        logger.info('PaymentScreen', 'Skipping Razorpay modal (mock mode or mock order)', { isMockOrder, orderId: order.orderId });
        const { rental } = await confirmPayment({
          orderId: order.orderId,
          gatewayPaymentId: 'mock_payment_id',
          gatewaySignature: 'mock_signature',
        });
        setProcessing(false);
        onSuccess?.(rental);
        return;
      }

      // Step 3: Launch Razorpay modal
      // Map our UI method names to Razorpay's expected method names
      const razorpayMethodMap: Record<PaymentMethod, string> = {
        'upi': 'upi',
        'card': 'card',
        'wallet': 'wallet',
        'netbanking': 'netbanking',
      };
      
      const selectedRazorpayMethod = razorpayMethodMap[selectedMethod];
      
      const options = {
        description: `Rental for ${order.contentTitle || content.title}`,
        image: content.thumbnail,
        currency: order.currency ?? 'INR',
        key: order.gatewayKey ?? ENV.RAZORPAY_KEY_ID,
        amount: typeof order.amountINR === 'number' && !isNaN(order.amountINR) ? order.amountINR * 100 : content.price * 100,
        order_id: order.gatewayOrderId || order.orderId,
        name: 'Shortsy',
        prefill: {
          email: '', // Optionally fill from user profile
          contact: '',
          name: '',
        },
        theme: { color: COLORS.brand.primaryDark },
        config: {
          display: {
            preferences: {
              show_default_blocks: false,
            },
            sequence: [selectedRazorpayMethod],
            blocks: {
              [selectedRazorpayMethod]: {
                name: selectedRazorpayMethod.charAt(0).toUpperCase() + selectedRazorpayMethod.slice(1),
                instruments: [
                  {
                    method: selectedRazorpayMethod,
                  },
                ],
              },
            },
          },
        },
      };

      logger.info('PaymentScreen', 'Launching Razorpay modal', { options });
      Object.entries(options).forEach(([key, value]) => {
        logger.info('PaymentScreen', `Razorpay option: ${key}`, { value });
      });
      
      interface RazorpayResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature?: string;
      }
      
      const razorpayRes = await new Promise<RazorpayResponse>((resolve, reject) => {
        RazorpayCheckout.open(options)
          .then((res: any) => {
            logger.info('PaymentScreen', 'Razorpay modal success - FULL RESPONSE', { res });
            logger.info('PaymentScreen', 'Razorpay payment_id', { value: res.razorpay_payment_id });
            logger.info('PaymentScreen', 'Razorpay order_id', { value: res.razorpay_order_id });
            logger.info('PaymentScreen', 'Razorpay signature', { value: res.razorpay_signature });
            resolve(res);
          })
          .catch((err: any) => {
            logger.error('PaymentScreen', 'Razorpay modal error', { err });
            reject(err);
          });
      });

      // Step 3: Confirm payment with gateway response
      // Use the original custom orderId from the backend, NOT the Razorpay order ID
      logger.info('PaymentScreen', 'ConfirmPayment request', {
        orderId: order.orderId,
        gatewayPaymentId: razorpayRes.razorpay_payment_id,
        gatewaySignature: razorpayRes.razorpay_signature ?? 'missing_signature',
        gatewayOrderId: razorpayRes.razorpay_order_id,
      });
      const { rental } = await confirmPayment({
        orderId: order.orderId,
        gatewayPaymentId: razorpayRes.razorpay_payment_id,
        gatewaySignature: razorpayRes.razorpay_signature ?? `mock_sig_${razorpayRes.razorpay_payment_id}`,
      });
      logger.info('PaymentScreen', 'Payment confirmed', {
        transactionId: rental.transactionId,
        expiresAt: rental.expiresAt,
      });

      // Step 4: Notify parent — triggers addRented + navigate to paymentSuccess
      onSuccess(rental);
    } catch (err: any) {
      // If the content is already rented, treat as success (idempotent)
      const isAlreadyRented = err?.code === 'ALREADY_RENTED';
      if (isAlreadyRented) {
        logger.warn('PaymentScreen', 'Content already rented — skipping gateway', { contentId: content.id });
        // Build a minimal stub rental for the success screen
        const stubRental: RentalRecord = {
          contentId: content.id,
          userId: 'mock_user',
          rentedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (content.type === 'vertical-series' ? 7 : 2) * 24 * 60 * 60 * 1000).toISOString(),
          amountPaid: content.price,
          transactionId: `txn_${Date.now()}`,
        };
        onSuccess(stubRental);
      } else {
        logger.error('PaymentScreen', 'Payment failed', err);
        const errorMessage = err?.description || err?.message || 'Payment failed. Please try again.';
        setErrorModal({ visible: true, message: errorMessage });
        setProcessing(false);
      }
    }
  };

  const methods: { key: PaymentMethod; label: string; iconName: string }[] = [
    { key: 'upi',        label: 'UPI',         iconName: 'phone-portrait-outline' },
    { key: 'card',       label: 'Card',         iconName: 'card-outline' },
    { key: 'wallet',     label: 'Wallet',       iconName: 'wallet-outline' },
    { key: 'netbanking', label: 'Net Banking',  iconName: 'business-outline' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.icon.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <Text style={styles.headerSub}>Secure checkout</Text>
          </View>
          <TouchableOpacity
            style={styles.shieldBtn}
            activeOpacity={0.75}
            onPress={() => { setSecurityTip(v => !v); setTimeout(() => setSecurityTip(false), 2500); }}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.accent.green} />
            {securityTip && (
              <View style={styles.shieldTip}>
                <Text style={styles.shieldTipText}>256-bit SSL secured</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* ── Order Summary ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Order Summary</Text>

            <View style={styles.summaryRow}>
              {/* Thumbnail */}
              <View style={styles.thumbWrap}>
                <LinearGradient
                  colors={COLORS.gradient.thumbFallback}
                  style={StyleSheet.absoluteFill}
                />
                {content.thumbnail ? (
                  <Image
                    source={{ uri: content.thumbnail }}
                    style={styles.thumbImg}
                    resizeMode="cover"
                  />
                ) : null}
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle} numberOfLines={2}>{content.title}</Text>
                <Text style={styles.summaryDir}>{content.director}</Text>
                <View style={styles.summaryBadges}>
                  {content.type === 'vertical-series' && content.episodes && (
                    <View style={styles.badgePurple}>
                      <Text style={styles.badgeText}>{content.episodes} Episodes</Text>
                    </View>
                  )}
                  <View style={styles.badgeOutline}>
                    <Text style={styles.badgeOutlineText}>{content.duration}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Price breakdown */}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceDim}>Rental Price</Text>
              <Text style={styles.priceWhite}>₹{content.price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceDim}>Processing Fee</Text>
              <Text style={styles.priceWhite}>₹0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{content.price}</Text>
            </View>
          </View>

          {/* ── Access Info ── */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent.blue} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Access Details</Text>
              <Text style={styles.infoBody}>
                {content.type === 'vertical-series'
                  ? `You will get ${ENV.RENTAL_EXPIRY_VERTICAL_SERIES_DAYS} ${ENV.RENTAL_EXPIRY_VERTICAL_SERIES_DAYS === 1 ? 'day' : 'days'} unlimited access to all episodes`
                  : `You will get ${ENV.RENTAL_EXPIRY_SHORT_FILM_DAYS}-day viewing access`}
              </Text>
            </View>
          </View>

          {/* ── Method selector ── */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.methodGrid}>
          {methods.map(({ key, label, iconName }) => {
              const active = selectedMethod === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.methodBtn, active && styles.methodBtnActive]}
                  onPress={() => setSelectedMethod(key)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={iconName as any}
                    size={26}
                    color={active ? COLORS.brand.violet : COLORS.text.tertiary}
                  />
                  <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>



          {/* ── Security badge ── */}
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.text.dimmed} />
            <Text style={styles.securityText}>Secured by 256-bit SSL encryption</Text>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── Pay button ── */}
        <View style={styles.ctaWrap}>
          <LinearGradient
            colors={COLORS.gradient.ctaFade}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={handlePay}
            activeOpacity={isValid() && !processing ? 0.85 : 1}
            style={[styles.payBtn, (!isValid() || processing) && styles.payBtnDisabled]}>
            <LinearGradient
              colors={COLORS.gradient.progress}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            {processing ? (
              <View style={styles.payBtnInner}>
                <Spinner />
                <Text style={styles.payBtnText}>Processing Payment...</Text>
              </View>
            ) : (
              <Text style={styles.payBtnText}>Pay ₹{content.price}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Error Modal ── */}
      {errorModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Failed</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, message: '' })}
              activeOpacity={0.8}>
              <LinearGradient
                colors={COLORS.gradient.progress}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
              />
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onBack}
              activeOpacity={0.8}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:      { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.bg.black },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.elevated,
    backgroundColor: COLORS.overlay.headerBg,
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle:{ fontSize: 20, fontWeight: '700', color: COLORS.text.primary },
  headerSub:  { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },

  scroll: { padding: 20, gap: 16 },

  card: {
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 },

  summaryRow:   { flexDirection: 'row', gap: 14 },
  thumbWrap:    { width: 72, height: 100, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.bg.elevated },
  thumbImg:     { ...StyleSheet.absoluteFillObject },
  summaryInfo:  { flex: 1, gap: 4 },
  summaryTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary, lineHeight: 20 },
  summaryDir:   { fontSize: 12, color: COLORS.text.muted },
  summaryBadges:{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  badgePurple:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: COLORS.brand.primaryDark },
  badgeOutline: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border.medium },
  badgeText:    { fontSize: 11, color: COLORS.text.primary, fontWeight: '600' },
  badgeOutlineText: { fontSize: 11, color: COLORS.text.secondary },

  divider:    { height: 1, backgroundColor: COLORS.border.subtle },
  priceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceDim:   { fontSize: 13, color: COLORS.text.muted },
  priceWhite: { fontSize: 13, color: COLORS.text.primary },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.brand.violet },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.overlay.infoBg,
    borderWidth: 1,
    borderColor: COLORS.overlay.infoBorder,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  infoIconWrap: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  infoContent: { flex: 1 },
  infoTitle:   { fontSize: 13, fontWeight: '600', color: COLORS.accent.blue, marginBottom: 2 },
  infoBody:    { fontSize: 13, color: COLORS.accent.blueSoft, lineHeight: 18 },

  shieldBtn: {
    position: 'relative',
    padding: 4,
  },
  shieldTip: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: COLORS.bg.elevated,
    borderWidth: 1,
    borderColor: COLORS.accent.greenTip,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 160,
  },
  shieldTipText: {
    fontSize: 12,
    color: COLORS.accent.green,
    fontWeight: '500',
    textAlign: 'center',
  },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary },

  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  methodBtn: {
    width: '47.5%',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.bg.subtle,
    alignItems: 'center',
    gap: 8,
  },
  methodBtnActive: { borderColor: COLORS.brand.primaryDark, backgroundColor: COLORS.overlay.brandTint },
  methodLabel:     { fontSize: 13, fontWeight: '500', color: COLORS.text.muted },
  methodLabelActive:{ color: COLORS.brand.violet },

  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  securityText:{ fontSize: 12, color: COLORS.text.dimmed },

  ctaWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  payBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  payBtnDisabled: { opacity: 0.45 },
  payBtnInner:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtnText:     { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, zIndex: 1 },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay.modal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.text.tertiary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    zIndex: 1,
  },
  modalCancelButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.overlay.spinner,
    borderTopColor: COLORS.text.primary,
  },
});
