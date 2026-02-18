import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckCircleIcon() {
  return (
    <View style={iconStyles.checkOuter}>
      {/* Checkmark: two bars forming a tick */}
      <View style={[iconStyles.checkBar, iconStyles.checkShort]} />
      <View style={[iconStyles.checkBar, iconStyles.checkLong]} />
    </View>
  );
}

function PlayIcon() {
  return (
    <View style={iconStyles.playTriangle} />
  );
}

function DownloadIcon() {
  return (
    <View style={iconStyles.dlWrap}>
      <View style={iconStyles.dlStem} />
      <View style={iconStyles.dlArrowL} />
      <View style={iconStyles.dlArrowR} />
      <View style={iconStyles.dlBase} />
    </View>
  );
}

function ShareIcon() {
  return (
    <View style={iconStyles.shareWrap}>
      <View style={iconStyles.shareDotTop} />
      <View style={iconStyles.shareDotBL} />
      <View style={iconStyles.shareDotBR} />
      <View style={iconStyles.shareLine1} />
      <View style={iconStyles.shareLine2} />
    </View>
  );
}

// ─── Ripple circle (ping animation) ──────────────────────────────────────────
function RippleRing() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale,   { toValue: 2.2, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        iconStyles.ripple,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

// ─── Pulsing background blob ──────────────────────────────────────────────────
function PulseBlob() {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.blob, { opacity }]} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentSuccessScreenProps {
  content: Content;
  onWatchNow: () => void;
  onGoHome: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PaymentSuccessScreen({
  content,
  onWatchNow,
  onGoHome,
}: PaymentSuccessScreenProps) {
  // Pop-in animation for the whole card
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [cardScale, cardOpacity]);

  return (
    <View style={styles.container}>
      {/* Background pulse blob */}
      <PulseBlob />

      <Animated.View style={[styles.inner, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>

        {/* ── Success icon ── */}
        <View style={styles.iconWrap}>
          <RippleRing />
          <View style={styles.iconCircle}>
            <CheckCircleIcon />
          </View>
        </View>

        {/* ── Message ── */}
        <View style={styles.msgWrap}>
          <Text style={styles.msgTitle}>Payment Successful!</Text>
          <Text style={styles.msgSub}>Your rental is now active and ready to watch</Text>
        </View>

        {/* ── Content info card ── */}
        <View style={styles.contentCard}>
          <View style={styles.thumbWrap}>
            <LinearGradient colors={['#1e1b4b', '#4338ca']} style={StyleSheet.absoluteFill} />
            {content.thumbnail ? (
              <Image source={{ uri: content.thumbnail }} style={styles.thumbImg} resizeMode="cover" />
            ) : null}
          </View>
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle} numberOfLines={2}>{content.title}</Text>
            <Text style={styles.contentDir}>{content.director}</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount Paid</Text>
              <Text style={styles.receiptGreen}>₹{content.price}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Access Duration</Text>
              <Text style={styles.receiptValue}>
                {content.type === 'vertical-series' ? '7 days' : '48 hours'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Creator support banner ── */}
        <View style={styles.creatorBanner}>
          <Text style={styles.creatorText}>
            70% of your payment goes directly to the creator. Thank you for supporting independent cinema! 🎬
          </Text>
        </View>

        {/* ── CTA buttons ── */}
        <View style={styles.actions}>
          {/* Watch Now */}
          <TouchableOpacity onPress={onWatchNow} activeOpacity={0.85} style={styles.watchBtn}>
            <LinearGradient
              colors={['#7c3aed', '#db2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <PlayIcon />
            <Text style={styles.watchBtnText}>Watch Now</Text>
          </TouchableOpacity>

          {/* Receipt + Share */}
          <View style={styles.secondRow}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
              <DownloadIcon />
              <Text style={styles.outlineBtnText}>Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
              <ShareIcon />
              <Text style={styles.outlineBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Home */}
          <TouchableOpacity onPress={onGoHome} activeOpacity={0.7} style={styles.ghostBtn}>
            <Text style={styles.ghostBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  blob: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#7c3aed',
    top: '50%',
    left: '50%',
    marginLeft: -180,
    marginTop: -180,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 20,
    zIndex: 1,
  },

  // Icon
  iconWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },

  // Message
  msgWrap:  { alignItems: 'center', gap: 6 },
  msgTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center' },
  msgSub:   { fontSize: 14, color: '#737373', textAlign: 'center', lineHeight: 20 },

  // Content card
  contentCard: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  thumbWrap: { width: 72, height: 100, borderRadius: 10, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  thumbImg:  { ...StyleSheet.absoluteFillObject },
  contentInfo: { flex: 1, gap: 4 },
  contentTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff', lineHeight: 20 },
  contentDir:   { fontSize: 12, color: '#737373', marginBottom: 6 },
  receiptRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLabel: { fontSize: 12, color: '#525252' },
  receiptGreen: { fontSize: 13, fontWeight: '700', color: '#22c55e' },
  receiptValue: { fontSize: 13, color: '#ffffff' },

  // Creator banner
  creatorBanner: {
    width: '100%',
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderRadius: 14,
    padding: 14,
  },
  creatorText: { fontSize: 13, color: '#c084fc', textAlign: 'center', lineHeight: 19 },

  // Actions
  actions: { width: '100%', gap: 10 },
  watchBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  watchBtnText: { fontSize: 18, fontWeight: '700', color: '#ffffff', zIndex: 1 },

  secondRow:  { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  outlineBtnText: { fontSize: 14, color: '#ffffff', fontWeight: '500' },

  ghostBtn:     { height: 44, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 14, color: '#737373' },
});

const iconStyles = StyleSheet.create({
  // Ripple
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(34,197,94,0.4)',
  },

  // CheckCircle
  checkOuter: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  checkBar:   { position: 'absolute', height: 3.5, backgroundColor: '#22c55e', borderRadius: 2 },
  checkShort: { width: 14, bottom: 17, left: 8, transform: [{ rotate: '45deg' }] },
  checkLong:  { width: 24, bottom: 20, right: 5, transform: [{ rotate: '-50deg' }] },

  // Play triangle
  playTriangle: {
    width: 0, height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ffffff',
    zIndex: 1,
  },

  // Download
  dlWrap:  { width: 18, height: 18, alignItems: 'center' },
  dlStem:  { position: 'absolute', top: 0, width: 2, height: 10, backgroundColor: '#ffffff', borderRadius: 1 },
  dlArrowL:{ position: 'absolute', top: 7, left: 4, width: 7, height: 2, backgroundColor: '#ffffff', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  dlArrowR:{ position: 'absolute', top: 7, right: 4, width: 7, height: 2, backgroundColor: '#ffffff', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  dlBase:  { position: 'absolute', bottom: 0, width: 14, height: 2, backgroundColor: '#ffffff', borderRadius: 1 },

  // Share
  shareWrap:   { width: 18, height: 16 },
  shareDotTop: { position: 'absolute', top: 0, right: 0, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ffffff' },
  shareDotBL:  { position: 'absolute', bottom: 0, left: 0, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ffffff' },
  shareDotBR:  { position: 'absolute', bottom: 0, right: 0, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ffffff' },
  shareLine1:  { position: 'absolute', width: 12, height: 1.5, backgroundColor: '#ffffff', top: 4, left: 2, transform: [{ rotate: '-35deg' }] },
  shareLine2:  { position: 'absolute', width: 12, height: 1.5, backgroundColor: '#ffffff', bottom: 4, left: 2, transform: [{ rotate: '35deg' }] },
});
