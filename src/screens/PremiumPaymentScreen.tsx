import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import RazorpayCheckout from 'react-native-razorpay';
import {
  confirmPremiumSubscription,
  initiatePremiumSubscription,
} from '../services/premiumService';
import { logger } from '../utils/logger';
import { ENV } from '../constants/env';
import type { PremiumSubscription } from '../services/premiumService';

const { width } = Dimensions.get('window');

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.5, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, [glow]);

  return (
    <LinearGradient
      colors={['#1e0a3c', '#7c3aed', '#c026d3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}>
      <Animated.View style={[styles.heroOrb, { opacity: glow }]} />

      <View style={styles.heroIconWrap}>
        <LinearGradient
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)']}
          style={styles.heroIconBg}>
          <Ionicons name="diamond" size={30} color="#fde047" />
        </LinearGradient>
      </View>

      <Text style={styles.heroLabel}>SHORTSY +</Text>
      <Text style={styles.heroTagline}>Creator-owned cinema, unlimited.</Text>

      <View style={styles.heroPill}>
        <Ionicons name="star" size={11} color="#fde047" />
        <Text style={styles.heroPillText}>Most Popular Plan</Text>
      </View>
    </LinearGradient>
  );
}

// ─── Price card ───────────────────────────────────────────────────────────────
function PriceCard() {
  return (
    <View style={styles.priceCard}>
      <View style={styles.priceLabelRow}>
        <Text style={styles.priceLabel}>Monthly Plan</Text>
        <View style={styles.bestValueTag}>
          <Text style={styles.bestValueText}>BEST VALUE</Text>
        </View>
      </View>

      <View style={styles.priceAmountRow}>
        <Text style={styles.priceCurrency}>₹</Text>
        <Text style={styles.priceAmount}>{ENV.PREMIUM_PRICE_INR}</Text>
        <View style={styles.pricePeriodStack}>
          <Text style={styles.pricePer}>per</Text>
          <Text style={styles.pricePeriod}>month</Text>
        </View>
      </View>

      <View style={styles.priceDivider} />

      <View style={styles.priceInfoRow}>
        <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
        <Text style={styles.priceInfoText}>
          Activates immediately · Valid for 30 days
        </Text>
      </View>
    </View>
  );
}

// ─── Benefits ─────────────────────────────────────────────────────────────────
const BENEFITS: { icon: string; label: string }[] = [
  { icon: 'infinite-outline',       label: 'Unlimited premium content'      },
  { icon: 'film-outline',           label: 'Exclusive short films & series' },
  { icon: 'notifications-outline',  label: 'Early access to new releases'   },
  { icon: 'ban-outline',            label: 'Ad-free viewing experience'     },
  { icon: 'cloud-download-outline', label: 'Download for offline viewing'   },
  { icon: 'play-circle-outline',    label: 'HD quality streaming'           },
];

function BenefitsList() {
  return (
    <View style={styles.benefitsCard}>
      <View style={styles.benefitsHeader}>
        <View style={styles.benefitAccent} />
        <Text style={styles.benefitsTitle}>What's included</Text>
      </View>
      <View style={styles.benefitsGrid}>
        {BENEFITS.map(({ icon, label }) => (
          <View key={label} style={styles.benefitRow}>
            <View style={styles.benefitIconBox}>
              <Ionicons name={icon as any} size={18} color="#a855f7" />
            </View>
            <Text style={styles.benefitText}>{label}</Text>
            <Ionicons name="checkmark" size={14} color="#22c55e" />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TRUST: { icon: string; label: string }[] = [
  { icon: 'shield-checkmark-outline', label: 'Secure\nPayment' },
  { icon: 'flash-outline',            label: 'Instant\nAccess' },
  { icon: 'close-circle-outline',     label: 'Cancel\nAnytime' },
];

function TrustRow() {
  return (
    <View style={styles.trustRow}>
      {TRUST.map(({ icon, label }, i) => (
        <React.Fragment key={label}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconBox}>
              <Ionicons name={icon as any} size={18} color="#6b7280" />
            </View>
            <Text style={styles.trustLabel}>{label}</Text>
          </View>
          {i < TRUST.length - 1 && <View style={styles.trustSep} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PremiumPaymentScreenProps {
  onBack: () => void;
  onSuccess: (subscription: PremiumSubscription) => void;
  userEmail?: string;
  userName?: string;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function PremiumPaymentScreen({
  onBack,
  onSuccess,
  userEmail,
  userName,
}: PremiumPaymentScreenProps) {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    logger.info('PremiumPaymentScreen', 'Component mounted', { userEmail, userName });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayNow = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const order = await initiatePremiumSubscription();
      logger.info('PremiumPaymentScreen', 'Premium order created', { orderId: order.orderId });

      const options = {
        description: 'Shortsy Premium - Unlimited Access',
        image: 'https://cdn.shortsy.app/logo.png',
        currency: order.currency,
        key: order.gatewayKey,
        amount: order.amountINR * 100,
        order_id: order.gatewayOrderId,
        name: 'Shortsy Premium',
        prefill: { email: userEmail || '', contact: '', name: userName || '' },
        theme: { color: '#7c3aed' },
      };

      logger.info('PremiumPaymentScreen', 'Launching Razorpay', { orderId: order.orderId });

      interface RazorpayResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature?: string;
      }

      const razorpayRes = await new Promise<RazorpayResponse>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Payment timeout')), 60000);
        RazorpayCheckout.open(options)
          .then((res: any) => {
            clearTimeout(timeoutId);
            logger.info('PremiumPaymentScreen', 'Razorpay success', {
              paymentId: res.razorpay_payment_id,
            });
            resolve(res);
          })
          .catch((err: any) => {
            clearTimeout(timeoutId);
            logger.error('PremiumPaymentScreen', 'Razorpay error', err);
            reject(err);
          });
      });

      const { subscription } = await confirmPremiumSubscription({
        orderId: order.orderId,
        gatewayPaymentId: razorpayRes.razorpay_payment_id,
        gatewaySignature: razorpayRes.razorpay_signature || '',
      });

      logger.info('PremiumPaymentScreen', 'Premium confirmed', {
        subscriptionId: subscription.subscriptionId,
      });
      setProcessing(false);

      Alert.alert(
        'Welcome to Premium! 🎉',
        'You now have unlimited access to all premium content for 30 days.',
        [{ text: 'Start Watching', onPress: () => onSuccess(subscription) }],
      );
    } catch (err: any) {
      logger.error('PremiumPaymentScreen', 'Payment failed', err);
      setProcessing(false);
      Alert.alert(
        'Payment Failed',
        err?.description || err?.message || 'Payment failed. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Go Premium</Text>

          {/* Spacer mirrors backBtn to keep title centred */}
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <HeroSection />
        <PriceCard />
        <BenefitsList />
        <TrustRow />
        {/* Spacer so content clears the fixed CTA */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky pay button ── */}
      <View style={styles.ctaWrap}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.92)', '#000000']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <TouchableOpacity
          onPress={handlePayNow}
          activeOpacity={processing ? 1 : 0.85}
          disabled={processing}
          style={styles.payBtn}>
          <LinearGradient
            colors={['#7c3aed', '#db2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
          <View style={styles.payBtnInner}>
            {processing ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.payBtnText}>Processing…</Text>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={15} color="rgba(255,255,255,0.75)" />
                <Text style={styles.payBtnText}>Subscribe · ₹{ENV.PREMIUM_PRICE_INR} / month</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.ctaFooter}>
          <Ionicons name="shield-checkmark-outline" size={12} color="#3f3f46" />
          <Text style={styles.ctaFooterText}>Secured by Razorpay · Cancel anytime</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  // Header
  safeHeader: { backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1c1c1e',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 14,
  },

  // Hero
  hero: {
    borderRadius: 22,
    paddingTop: 5,
    paddingBottom: 36,
    paddingHorizontal: 0,
    alignItems: 'center',
    overflow: 'hidden',
    gap: 10,
  },
  heroOrb: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(192,38,211,0.3)',
    top: -width * 0.3,
    right: -width * 0.2,
  },
  heroIconWrap: {
    marginBottom: 6,
    shadowColor: '#fde047',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  heroIconBg: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 21,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3.5,
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
    backgroundColor: 'rgba(253,224,71,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.28)',
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fde047',
    letterSpacing: 0.6,
  },

  // Price card
  priceCard: {
    backgroundColor: '#0d0d0d',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2a1d4e',
    padding: 22,
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  bestValueTag: {
    backgroundColor: 'rgba(168,85,247,0.14)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
    letterSpacing: 0.8,
  },
  priceAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
    gap: 3,
  },
  priceCurrency: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  priceAmount: {
    fontSize: 68,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 72,
    letterSpacing: -2,
  },
  pricePeriodStack: {
    marginBottom: 14,
    marginLeft: 3,
  },
  pricePer: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
  pricePeriod: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    lineHeight: 18,
  },
  priceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1c1c1e',
    marginBottom: 14,
  },
  priceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  priceInfoText: {
    fontSize: 13,
    color: '#6b7280',
  },

  // Benefits
  benefitsCard: {
    backgroundColor: '#0d0d0d',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1c1c1e',
    padding: 20,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  benefitAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#a855f7',
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  benefitsGrid: { gap: 12 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(168,85,247,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#d4d4d4',
    lineHeight: 20,
  },

  // Trust
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080808',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1c1c1e',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  trustIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLabel: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '500',
  },
  trustSep: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: '#1c1c1e',
  },

  // CTA
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
  },
  payBtn: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  payBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  payBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  ctaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ctaFooterText: {
    fontSize: 11,
    color: '#3f3f46',
  },
});
