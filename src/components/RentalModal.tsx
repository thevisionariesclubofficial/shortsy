import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Content } from '../data/mockData';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CloseIcon() {
  return (
    <View style={iconStyles.closeWrap}>
      <View style={[iconStyles.closeBar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[iconStyles.closeBar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

function CheckIcon() {
  return (
    <View style={iconStyles.checkOuter}>
      <View style={[iconStyles.checkBar, iconStyles.checkShort]} />
      <View style={[iconStyles.checkBar, iconStyles.checkLong]} />
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

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, useNativeDriver: true }),
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={[iconStyles.spinner, { transform: [{ rotate }] }]} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type PayMethod = 'upi' | 'card' | 'wallet';

interface RentalModalProps {
  content: Content;
  onClose: () => void;
  onConfirm: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RentalModal({ content, onClose, onConfirm }: RentalModalProps) {
  const [selected,   setSelected]   = useState<PayMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(false);

  // Slide-up animation
  const translateY = useRef(new Animated.Value(400)).current;
  React.useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
  }, [translateY]);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(onConfirm, 1500);
    }, 2000);
  };

  const methods: { key: PayMethod; label: string; sub: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: 'upi',    label: 'UPI',   sub: 'GPay, PhonePe, Paytm', Icon: SmartphoneIcon },
    { key: 'card',   label: 'Card',  sub: 'Debit / Credit Card',  Icon: CreditCardIcon },
    { key: 'wallet', label: 'Wallet',sub: 'Paytm, Mobikwik',      Icon: WalletIcon },
  ];

  // ── Success view ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={styles.backdrop}>
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <CheckIcon />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Starting playback...</Text>
        </View>
      </View>
    );
  }

  // ── Modal sheet ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.backdrop}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* Content summary */}
        <View style={styles.summaryCard}>
          <View style={styles.thumbWrap}>
            <Image source={{ uri: content.thumbnail }} style={styles.thumbImg} resizeMode="cover" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle} numberOfLines={1}>{content.title}</Text>
            <Text style={styles.summaryDur}>{content.duration}</Text>
            <Text style={styles.summaryPrice}>₹{content.price}</Text>
          </View>
        </View>

        {/* Method selector */}
        <Text style={styles.methodLabel}>Payment Method</Text>
        <View style={styles.methods}>
          {methods.map(({ key, label, sub, Icon }) => {
            const active = selected === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.methodRow, active && styles.methodRowActive]}
                onPress={() => setSelected(key)}
                activeOpacity={0.7}>
                <Icon active={active} />
                <View style={styles.methodText}>
                  <Text style={[styles.methodName, active && styles.methodNameActive]}>{label}</Text>
                  <Text style={styles.methodSub}>{sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, processing && styles.payBtnProcessing]}
          onPress={handlePay}
          activeOpacity={0.85}
          disabled={processing}>
          {processing ? (
            <View style={styles.payBtnRow}>
              <Spinner />
              <Text style={styles.payBtnText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{content.price}</Text>
          )}
        </TouchableOpacity>

        {/* Access note */}
        <Text style={styles.note}>
          {content.type === 'vertical-series'
            ? 'You will get full season access for 7 days'
            : 'You will get 48-hour viewing access'}
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },

  // Sheet
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: '#2a2a2a',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  // Summary
  summaryCard: { flexDirection: 'row', gap: 14, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginTop: 16 },
  thumbWrap:   { width: 56, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0d0d0d' },
  thumbImg:    { width: '100%', height: '100%' },
  summaryInfo: { flex: 1, justifyContent: 'space-between' },
  summaryTitle:{ fontSize: 14, fontWeight: '600', color: '#ffffff' },
  summaryDur:  { fontSize: 12, color: '#737373' },
  summaryPrice:{ fontSize: 18, fontWeight: '700', color: '#ffffff' },

  // Methods
  methodLabel: { fontSize: 12, fontWeight: '600', color: '#737373', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 10 },
  methods:     { gap: 10 },
  methodRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#1e1e1e', backgroundColor: '#1a1a1a' },
  methodRowActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)' },
  methodText:  { flex: 1 },
  methodName:  { fontSize: 14, fontWeight: '600', color: '#a3a3a3' },
  methodNameActive: { color: '#a855f7' },
  methodSub:   { fontSize: 11, color: '#525252', marginTop: 2 },

  // Pay button
  payBtn: { height: 52, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  payBtnProcessing: { opacity: 0.7 },
  payBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },

  note: { fontSize: 12, color: '#525252', textAlign: 'center', marginTop: 12 },

  // Success
  successCard: { backgroundColor: '#111111', borderRadius: 24, padding: 40, alignItems: 'center', gap: 14, margin: 24 },
  successIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  successSub:   { fontSize: 14, color: '#737373' },
});

const iconStyles = StyleSheet.create({
  // Close X
  closeWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  closeBar:  { position: 'absolute', width: 16, height: 2, backgroundColor: '#737373', borderRadius: 1 },

  // Check
  checkOuter: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  checkBar:   { position: 'absolute', height: 3, backgroundColor: '#22c55e', borderRadius: 2 },
  checkShort: { width: 12, bottom: 15, left: 8, transform: [{ rotate: '45deg' }] },
  checkLong:  { width: 22, bottom: 19, right: 4, transform: [{ rotate: '-50deg' }] },

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

  // Spinner
  spinner: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#ffffff' },
});
