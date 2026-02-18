import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';

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
  onSuccess: () => void;
}

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  maxLength?: number;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fStyles.wrap}>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput
        style={[fStyles.input, focused && fStyles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#525252"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
      />
      {hint && <Text style={fStyles.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PaymentScreen({ content, onBack, onSuccess }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  const isValid = () => {
    if (selectedMethod === 'upi') return upiId.trim().length > 0;
    if (selectedMethod === 'card')
      return cardNumber.length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.trim().length > 0;
    return true; // wallet / netbanking: just pick one
  };

  const handlePay = () => {
    if (!isValid() || processing) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2500);
  };

  const methods: { key: PaymentMethod; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: 'upi',        label: 'UPI',         Icon: SmartphoneIcon },
    { key: 'card',       label: 'Card',         Icon: CreditCardIcon },
    { key: 'wallet',     label: 'Wallet',       Icon: WalletIcon },
    { key: 'netbanking', label: 'Net Banking',  Icon: BankIcon },
  ];

  const wallets    = ['Paytm', 'PhonePe', 'Mobikwik', 'Amazon Pay'];
  const banks      = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Other Banks'];

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

          {/* ── Form ── */}
          <View style={styles.card}>
            {selectedMethod === 'upi' && (
              <Field
                label="UPI ID"
                value={upiId}
                onChangeText={setUpiId}
                placeholder="yourname@upi"
                keyboardType="email-address"
                hint="Enter your UPI ID (Google Pay, PhonePe, Paytm, etc.)"
              />
            )}

            {selectedMethod === 'card' && (
              <>
                <Field
                  label="Card Number"
                  value={cardNumber}
                  onChangeText={t => setCardNumber(t.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={16}
                />
                <Field
                  label="Cardholder Name"
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="John Doe"
                />
                <View style={styles.row2}>
                  <View style={styles.flex}>
                    <Field
                      label="Expiry"
                      value={cardExpiry}
                      onChangeText={t => {
                        const d = t.replace(/\D/g, '');
                        setCardExpiry(d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2, 4) : d);
                      }}
                      placeholder="MM/YY"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Field
                      label="CVV"
                      value={cardCvv}
                      onChangeText={t => setCardCvv(t.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
              </>
            )}

            {selectedMethod === 'wallet' && (
              <>
                <Text style={styles.subLabel}>Select Wallet Provider</Text>
                {wallets.map(w => (
                  <TouchableOpacity key={w} style={styles.listItem} activeOpacity={0.7}>
                    <Text style={styles.listItemText}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {selectedMethod === 'netbanking' && (
              <>
                <Text style={styles.subLabel}>Select Your Bank</Text>
                {banks.map(b => (
                  <TouchableOpacity key={b} style={styles.listItem} activeOpacity={0.7}>
                    <Text style={styles.listItemText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
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

  row2:    { flexDirection: 'row', gap: 12 },
  subLabel:{ fontSize: 13, color: '#737373', marginBottom: 4 },
  listItem:{ backgroundColor: '#1a1a1a', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 6 },
  listItemText: { fontSize: 14, color: '#ffffff' },

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
});

const fStyles = StyleSheet.create({
  wrap:        { gap: 6 },
  label:       { fontSize: 13, color: '#737373' },
  input:       { height: 48, borderRadius: 10, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', paddingHorizontal: 14, fontSize: 15, color: '#ffffff' },
  inputFocused:{ borderColor: '#7c3aed' },
  hint:        { fontSize: 11, color: '#525252' },
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
