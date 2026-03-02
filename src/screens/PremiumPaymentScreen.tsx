import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { initiatePremiumSubscription, confirmPremiumSubscription } from '../services/premiumService';
import { logger } from '../utils/logger';
import type { PremiumSubscription } from '../services/premiumService';

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

function CheckCircleIcon() {
  return (
    <View style={iconStyles.checkOuter}>
      <View style={iconStyles.checkLeft} />
      <View style={iconStyles.checkRight} />
    </View>
  );
}

function CrownIcon({ size = 28 }: { size?: number }) {
  return (
    <View style={[iconStyles.crownWrap, { width: size, height: size }]}>
      <View style={[iconStyles.crownBase, { width: size * 0.8, height: size * 0.4 }]} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeL, { width: size * 0.15, height: size * 0.4 }]} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeC, { width: size * 0.15, height: size * 0.5 }]} />
      <View style={[iconStyles.crownSpike, iconStyles.crownSpikeR, { width: size * 0.15, height: size * 0.4 }]} />
    </View>
  );
}

function Spinner() {
  return (
    <View style={iconStyles.spinner} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PremiumPaymentScreenProps {
  onBack: () => void;
  onSuccess: (subscription: PremiumSubscription) => void;
  userEmail?: string;
  userName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PremiumPaymentScreen({ onBack, onSuccess, userEmail, userName }: PremiumPaymentScreenProps) {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    logger.info('PremiumPaymentScreen', 'Component mounted', { userEmail, userName });
  }, []);

  const benefits = [
    'Unlimited access to premium content',
    'Watch exclusive short films',
    'Early access to new releases',
    'Ad-free viewing experience',
    'Download for offline viewing',
    'HD quality streaming',
  ];

  const handlePayNow = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // Step 1: Create premium order
      const order = await initiatePremiumSubscription();
      logger.info('PremiumPaymentScreen', 'Premium order created', { orderId: order.orderId });

      // Step 2: Launch Razorpay
      const options = {
        description: 'Shortsy Premium - Unlimited Access',
        image: 'https://cdn.shortsy.app/logo.png',
        currency: order.currency,
        key: order.gatewayKey,
        amount: order.amountINR * 100,
        order_id: order.gatewayOrderId,
        name: 'Shortsy Premium',
        prefill: {
          email: userEmail || '',
          contact: '',
          name: userName || '',
        },
        theme: { color: '#7c3aed' },
      };

      logger.info('PremiumPaymentScreen', 'Launching Razorpay', { orderId: order.orderId });

      interface RazorpayResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature?: string;
      }

      const razorpayRes = await new Promise<RazorpayResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Payment timeout'));
        }, 60000);

        RazorpayCheckout.open(options)
          .then((res: any) => {
            clearTimeout(timeoutId);
            logger.info('PremiumPaymentScreen', 'Razorpay success', { paymentId: res.razorpay_payment_id });
            resolve(res);
          })
          .catch((err: any) => {
            clearTimeout(timeoutId);
            logger.error('PremiumPaymentScreen', 'Razorpay error', err);
            reject(err);
          });
      });

      // Step 3: Confirm payment
      const { subscription } = await confirmPremiumSubscription({
        orderId: order.orderId,
        gatewayPaymentId: razorpayRes.razorpay_payment_id,
        gatewaySignature: razorpayRes.razorpay_signature || '',
      });

      logger.info('PremiumPaymentScreen', 'Premium confirmed', { subscriptionId: subscription.subscriptionId });
      setProcessing(false);
      
      Alert.alert(
        'Welcome to Premium! 🎉',
        'You now have unlimited access to all premium content for 30 days.',
        [{ 
          text: 'Start Watching', 
          style: 'default',
          onPress: () => onSuccess(subscription)
        }]
      );
    } catch (err: any) {
      logger.error('PremiumPaymentScreen', 'Payment failed', err);
      setProcessing(false);
      
      const errorMessage = err?.description || err?.message || 'Payment failed. Please try again.';
      Alert.alert('Payment Failed', errorMessage, [{ text: 'OK', style: 'default' }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Premium Subscription</Text>
          <Text style={styles.headerSub}>Unlock unlimited access</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* ── Premium Badge ── */}
        <View style={styles.badgeWrap}>
          <LinearGradient
            colors={['#7c3aed', '#db2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}>
            <CrownIcon size={48} />
            <Text style={styles.badgeTitle}>SHORTSY PREMIUM</Text>
            <Text style={styles.badgeSubtitle}>Premium Membership</Text>
          </LinearGradient>
        </View>

        {/* ── Price Card ── */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Subscription Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>₹199</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <Text style={styles.priceNote}>Valid for 30 days from activation</Text>
        </View>

        {/* ── Benefits ── */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What's Included</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <CheckCircleIcon />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* ── Info Note ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your subscription will be active immediately after successful payment. 
            You can cancel anytime from your account settings.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Pay Button ── */}
      <View style={styles.ctaWrap}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)', '#000000']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <TouchableOpacity
          onPress={handlePayNow}
          activeOpacity={processing ? 1 : 0.85}
          style={[styles.payBtn, processing && styles.payBtnDisabled]}>
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
            <Text style={styles.payBtnText}>Pay ₹199 Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  headerSub: { fontSize: 12, color: '#737373', marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20 },

  badgeWrap: { marginTop: 10 },
  badgeGradient: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  badgeSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },

  priceCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  priceLabel: {
    fontSize: 13,
    color: '#737373',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#a855f7',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#737373',
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 12,
    color: '#525252',
    marginTop: 8,
  },

  benefitsCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#d4d4d4',
    lineHeight: 20,
  },

  infoBox: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#93c5fd',
    lineHeight: 20,
    textAlign: 'center',
  },

  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  payBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtnText: { fontSize: 18, fontWeight: '700', color: '#ffffff', zIndex: 1 },
});

const iconStyles = StyleSheet.create({
  arrowWrap: { width: 20, height: 20, justifyContent: 'center' },
  arrowStem: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  arrowTip: {
    position: 'absolute',
    left: 2,
    width: 8,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  arrowTipUp: { transform: [{ rotate: '45deg' }], top: 5 },
  arrowTipDown: { transform: [{ rotate: '-45deg' }], bottom: 5 },

  checkOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLeft: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    bottom: 8,
    left: 5,
    transform: [{ rotate: '45deg' }],
  },
  checkRight: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    bottom: 9,
    right: 4,
    transform: [{ rotate: '-45deg' }],
  },

  crownWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  crownBase: {
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  crownSpike: {
    position: 'absolute',
    backgroundColor: '#fbbf24',
  },
  crownSpikeL: { left: '15%', bottom: '35%' },
  crownSpikeC: { left: '42.5%', bottom: '40%' },
  crownSpikeR: { right: '15%', bottom: '35%' },

  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
  },
});
