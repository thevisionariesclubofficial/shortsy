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
import { Content } from '../data/mockData';
import { confirmPayment, initiateRental } from '../services/rentalService';
import RazorpayCheckout from 'react-native-razorpay';
import { logger } from '../utils/logger';
import type { RentalRecord } from '../types/api';

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={[iconStyles.arrowTip, iconStyles.arrowTipUp]} />
      <View style={[iconStyles.arrowTip, iconStyles.arrowTipDown]} />
    </View>
  );
}

function ShieldIcon({ color = '#22c55e' }: { color?: string }) {
  return (
    <View style={iconStyles.shieldWrap}>
      <View style={[iconStyles.shieldBody, { borderColor: color }]} />
      <View style={[iconStyles.shieldCheck, { backgroundColor: color }]} />
    </View>
  );
}

function InfoIcon() {
  return (
    <View style={iconStyles.infoOuter}>
      <Text style={iconStyles.infoText}>i</Text>
    </View>
  );
}

function SmartphoneIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#a3a3a3';
  return (
    <View style={[iconStyles.phoneOuter, { borderColor: c }]}>
      <View style={[iconStyles.phoneScreen, { backgroundColor: c + '33' }]} />
      <View style={[iconStyles.phoneDot, { backgroundColor: c }]} />
    </View>
  );
}

function CreditCardIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#a3a3a3';
  return (
    <View style={[iconStyles.cardOuter, { borderColor: c }]}>
      <View style={[iconStyles.cardStripe, { backgroundColor: c }]} />
      <View style={[iconStyles.cardChip, { backgroundColor: c + '55' }]} />
    </View>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#a3a3a3';
  return (
    <View style={[iconStyles.walletOuter, { borderColor: c }]}>
      <View style={[iconStyles.walletFlap, { borderColor: c }]} />
      <View style={[iconStyles.walletDot, { backgroundColor: c }]} />
    </View>
  );
}

function BankIcon({ active }: { active: boolean }) {
  const c = active ? '#a855f7' : '#a3a3a3';
  return (
    <View style={iconStyles.bankWrap}>
      <View style={[iconStyles.bankRoof, { backgroundColor: c }]} />
      {[0, 1, 2].map(i => (
        <View key={i} style={[iconStyles.bankPillar, { backgroundColor: c }]} />
      ))}
      <View style={[iconStyles.bankBase, { backgroundColor: c }]} />
    </View>
  );
}

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, useNativeDriver: true }),
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[iconStyles.spinner, { transform: [{ rotate }] }]} />
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
        key: order.gatewayKey ?? 'rzp_test_SLajOeA4k89FaD',
        amount: typeof order.amountINR === 'number' && !isNaN(order.amountINR) ? order.amountINR * 100 : content.price * 100,
        order_id: order.gatewayOrderId || order.orderId,
        name: 'Shortsy',
        prefill: {
          email: '', // Optionally fill from user profile
          contact: '',
          name: '',
        },
        theme: { color: '#7c3aed' },
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

  const methods: { key: PaymentMethod; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: 'upi',        label: 'UPI',         Icon: SmartphoneIcon },
    { key: 'card',       label: 'Card',         Icon: CreditCardIcon },
    { key: 'wallet',     label: 'Wallet',       Icon: WalletIcon },
    { key: 'netbanking', label: 'Net Banking',  Icon: BankIcon },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <Text style={styles.headerSub}>Secure checkout</Text>
          </View>
          <ShieldIcon />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* ── Order Summary ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Order Summary</Text>

            <View style={styles.summaryRow}>
              {/* Thumbnail */}
              <View style={styles.thumbWrap}>
                <LinearGradient
                  colors={['#1e1b4b', '#4338ca']}
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
            <InfoIcon />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Access Details</Text>
              <Text style={styles.infoBody}>
                {content.type === 'vertical-series'
                  ? 'You will get 7 days unlimited access to all episodes'
                  : 'You will get 48-hour viewing access'}
              </Text>
            </View>
          </View>

          {/* ── Method selector ── */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.methodGrid}>
            {methods.map(({ key, label, Icon }) => {
              const active = selectedMethod === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.methodBtn, active && styles.methodBtnActive]}
                  onPress={() => setSelectedMethod(key)}
                  activeOpacity={0.7}>
                  <Icon active={active} />
                  <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>



          {/* ── Security badge ── */}
          <View style={styles.securityRow}>
            <ShieldIcon color="#525252" />
            <Text style={styles.securityText}>Secured by 256-bit SSL encryption</Text>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── Pay button ── */}
        <View style={styles.ctaWrap}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.95)', '#000000']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={handlePay}
            activeOpacity={isValid() && !processing ? 0.85 : 1}
            style={[styles.payBtn, (!isValid() || processing) && styles.payBtnDisabled]}>
            <LinearGradient
              colors={['#7c3aed', '#db2777']}
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
                colors={['#7c3aed', '#db2777']}
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
  container: { flex: 1, backgroundColor: '#000000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: 'rgba(0,0,0,0.97)',
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle:{ fontSize: 20, fontWeight: '700', color: '#ffffff' },
  headerSub:  { fontSize: 12, color: '#737373', marginTop: 1 },

  scroll: { padding: 20, gap: 16 },

  card: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#737373', textTransform: 'uppercase', letterSpacing: 0.8 },

  summaryRow:   { flexDirection: 'row', gap: 14 },
  thumbWrap:    { width: 72, height: 100, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  thumbImg:     { ...StyleSheet.absoluteFillObject },
  summaryInfo:  { flex: 1, gap: 4 },
  summaryTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff', lineHeight: 20 },
  summaryDir:   { fontSize: 12, color: '#737373' },
  summaryBadges:{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  badgePurple:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: '#7c3aed' },
  badgeOutline: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#404040' },
  badgeText:    { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  badgeOutlineText: { fontSize: 11, color: '#d4d4d4' },

  divider:    { height: 1, backgroundColor: '#1e1e1e' },
  priceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceDim:   { fontSize: 13, color: '#737373' },
  priceWhite: { fontSize: 13, color: '#ffffff' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#a855f7' },

  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  infoContent: { flex: 1 },
  infoTitle:   { fontSize: 13, fontWeight: '600', color: '#60a5fa', marginBottom: 4 },
  infoBody:    { fontSize: 13, color: '#93c5fd', lineHeight: 18 },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  methodBtn: {
    width: '47.5%',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1e1e1e',
    backgroundColor: '#111111',
    alignItems: 'center',
    gap: 8,
  },
  methodBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)' },
  methodLabel:     { fontSize: 13, fontWeight: '500', color: '#737373' },
  methodLabelActive:{ color: '#a855f7' },

  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  securityText:{ fontSize: 12, color: '#525252' },

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
  payBtnText:     { fontSize: 18, fontWeight: '700', color: '#ffffff', zIndex: 1 },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#a3a3a3',
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
    color: '#ffffff',
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
    color: '#737373',
  },
});

const iconStyles = StyleSheet.create({
  // ArrowLeft
  arrowWrap:    { width: 20, height: 20, justifyContent: 'center' },
  arrowStem:    { position: 'absolute', left: 2, right: 2, height: 2, backgroundColor: '#ffffff', borderRadius: 1 },
  arrowTip:     { position: 'absolute', left: 2, width: 8, height: 2, backgroundColor: '#ffffff', borderRadius: 1 },
  arrowTipUp:   { transform: [{ rotate: '45deg' }], top: 5 },
  arrowTipDown: { transform: [{ rotate: '-45deg' }], bottom: 5 },

  // Shield
  shieldWrap:  { width: 20, height: 22, alignItems: 'center' },
  shieldBody:  { width: 18, height: 20, borderRadius: 4, borderWidth: 2, position: 'absolute' },
  shieldCheck: { position: 'absolute', bottom: 7, width: 8, height: 2, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // Info circle
  infoOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#60a5fa', alignItems: 'center', justifyContent: 'center' },
  infoText:  { fontSize: 12, fontWeight: '700', color: '#60a5fa', lineHeight: 14 },

  // Smartphone
  phoneOuter: { width: 18, height: 24, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  phoneScreen:{ width: 10, height: 12, borderRadius: 1 },
  phoneDot:   { width: 4, height: 4, borderRadius: 2 },

  // CreditCard
  cardOuter:  { width: 24, height: 18, borderRadius: 3, borderWidth: 2, justifyContent: 'space-between', paddingVertical: 2, paddingHorizontal: 2 },
  cardStripe: { height: 4, borderRadius: 1 },
  cardChip:   { width: 8, height: 6, borderRadius: 2 },

  // Wallet
  walletOuter: { width: 24, height: 18, borderRadius: 3, borderWidth: 2, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 3 },
  walletFlap:  { position: 'absolute', top: -1, left: 4, right: 0, height: 6, borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  walletDot:   { width: 6, height: 6, borderRadius: 3 },

  // Bank
  bankWrap:   { width: 22, height: 20, alignItems: 'center', gap: 2 },
  bankRoof:   { width: 22, height: 3, borderRadius: 1 },
  bankPillar: { position: 'absolute', bottom: 5, width: 3, height: 8, borderRadius: 1 },
  bankBase:   { width: 22, height: 2, borderRadius: 1, position: 'absolute', bottom: 3 },

  // Spinner
  spinner: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#ffffff' },
});
