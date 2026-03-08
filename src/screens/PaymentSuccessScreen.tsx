import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';
import type { RentalRecord } from '../types/api';
import { ENV } from '../constants/env';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Computes a human-readable access window from the rental record. */
function formatAccessDuration(rental: RentalRecord): string {
  const rentedAt  = new Date(rental.rentedAt).getTime();
  const expiresAt = new Date(rental.expiresAt).getTime();
  const diffHours = Math.round((expiresAt - rentedAt) / (1000 * 60 * 60));
  if (diffHours >= 24) return `${Math.round(diffHours / 24)} days`;
  return `${diffHours} hours`;
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function buildShareText(content: Content, rental: RentalRecord): string {
  return [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '         SHORTSY RECEIPT         ',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `Transaction ID : ${rental.transactionId}`,
    `Rented On      : ${fmt(rental.rentedAt)}`,
    `Expires On     : ${fmt(rental.expiresAt)}`,
    '',
    `Title          : ${content.title}`,
    `Director       : ${content.director}`,
    `Genre          : ${content.genre}`,
    `Language       : ${content.language}`,
    '',
    '─────────────────────────────',
    `Amount Paid    : ₹${rental.amountPaid}`,
    `Creator Earns  : ₹${Math.round(rental.amountPaid * ENV.CREATOR_REVENUE_SHARE)}  (${Math.round(ENV.CREATOR_REVENUE_SHARE * 100)}%)`,
    `Payment Status : CONFIRMED ✓`,
    '─────────────────────────────',
    '',
    'Thank you for supporting independent cinema! 🎬',
    ENV.APP_DOMAIN,
  ].join('\n');
}

// ─── ReceiptModal ───────────────────────────────────────────────────────────
function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={receiptStyles.row}>
      <Text style={receiptStyles.rowLabel}>{label}</Text>
      <Text style={[receiptStyles.rowValue, highlight && receiptStyles.rowValueGreen]}>
        {value}
      </Text>
    </View>
  );
}

function Perforation() {
  return (
    <View style={receiptStyles.perfWrap}>
      <View style={receiptStyles.perfHoleL} />
      <View style={receiptStyles.perfDashes}>
        {Array.from({ length: 18 }).map((_, i) => (
          <View key={i} style={receiptStyles.perfDash} />
        ))}
      </View>
      <View style={receiptStyles.perfHoleR} />
    </View>
  );
}

function ReceiptModal({
  visible, onClose, content, rental,
}: { visible: boolean; onClose: () => void; content: Content; rental: RentalRecord }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: buildShareText(content, rental),
        title: `Shortsy Receipt – ${content.title}`,
      });
    } catch { /* user cancelled */ }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={receiptStyles.modalRoot}>
        {/* Drag handle */}
        <View style={receiptStyles.handle} />

        {/* Header */}
        <View style={receiptStyles.modalHeader}>
          <Text style={receiptStyles.modalTitle}>Receipt</Text>
          <TouchableOpacity
            onPress={onClose}
            style={receiptStyles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color="#a3a3a3" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={receiptStyles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* ── Receipt paper ── */}
          <View style={receiptStyles.paper}>

            {/* Brand header */}
            <LinearGradient
              colors={['#7c3aed', '#db2777']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={receiptStyles.paperHeader}>
              <Text style={receiptStyles.brandName}>SHORTSY</Text>
              <Text style={receiptStyles.brandTagline}>Indie Cinema Platform</Text>
            </LinearGradient>

            {/* Status badge */}
            <View style={receiptStyles.statusWrap}>
              <View style={receiptStyles.statusBadge}>
                <View style={receiptStyles.statusDot} />
                <Text style={receiptStyles.statusText}>PAYMENT CONFIRMED</Text>
              </View>
            </View>

            {/* Content thumbnail + title */}
            <View style={receiptStyles.contentRow}>
              <View style={receiptStyles.thumbBox}>
                <LinearGradient colors={['#1e1b4b', '#4338ca']} style={StyleSheet.absoluteFill} />
                {content.thumbnail ? (
                  <Image source={{ uri: content.thumbnail }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : null}
              </View>
              <View style={receiptStyles.contentMeta}>
                <Text style={receiptStyles.contentTitle} numberOfLines={2}>{content.title}</Text>
                <Text style={receiptStyles.contentDir}>{content.director}</Text>
                <Text style={receiptStyles.contentGenre}>{content.genre} · {content.language}</Text>
              </View>
            </View>

            <View style={receiptStyles.divider} />

            {/* Transaction details */}
            <Text style={receiptStyles.sectionLabel}>TRANSACTION DETAILS</Text>
            <ReceiptRow label="Transaction ID" value={rental.transactionId} />
            <ReceiptRow label="Rented On"      value={fmt(rental.rentedAt)} />
            <ReceiptRow label="Expires On"     value={fmt(rental.expiresAt)} />
            <ReceiptRow label="Access Window"  value={formatAccessDuration(rental)} />

            <View style={receiptStyles.divider} />

            {/* Payment breakdown */}
            <Text style={receiptStyles.sectionLabel}>PAYMENT BREAKDOWN</Text>
            <ReceiptRow label="Amount Paid"   value={`₹${rental.amountPaid}`} highlight />
            <ReceiptRow label="Creator Earns" value={`₹${Math.round(rental.amountPaid * ENV.CREATOR_REVENUE_SHARE)}  (${Math.round(ENV.CREATOR_REVENUE_SHARE * 100)}%)`} />
            <ReceiptRow label="Platform Fee"  value={`₹${Math.round(rental.amountPaid * ENV.PLATFORM_FEE_SHARE)}  (${Math.round(ENV.PLATFORM_FEE_SHARE * 100)}%)`} />
            <ReceiptRow label="Payment Mode"  value="UPI / Card" />

            {/* Perforated tear line */}
            <Perforation />

            {/* Footer note */}
            <Text style={receiptStyles.footerNote}>
              {'Thank you for supporting independent cinema! 🎬\nThis receipt is your proof of rental. Keep it safe.'}
            </Text>
            <Text style={receiptStyles.footerUrl}>{ENV.APP_DOMAIN}</Text>
          </View>

          {/* Share / Download button */}
          <TouchableOpacity
            style={receiptStyles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.85}>
            <LinearGradient
              colors={['#7c3aed', '#db2777']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
            <Ionicons name="download-outline" size={18} color="#ffffff" />
            <Text style={receiptStyles.shareBtnText}>Download / Share Receipt</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
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
        styles.ripple,
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
  rental: RentalRecord;
  onWatchNow: () => void;
  onGoHome: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PaymentSuccessScreen({
  content,
  rental,
  onWatchNow,
  onGoHome,
}: PaymentSuccessScreenProps) {
  // Pop-in animation for the whole card
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [cardScale, cardOpacity]);

  const handleShare = async () => {
    const webLink = `${ENV.APP_WEB_URL}/open.html?id=${content.id}&title=${encodeURIComponent(content.title)}`;
    const message = `🎬 Watch "${content.title}" on Shortsy!\n\n${content.description?.slice(0, 120)}...\n\n${webLink}`;
    try {
      await Share.share({ message, title: content.title, url: webLink });
    } catch { /* user cancelled or share unavailable */ }
  };

  return (
    <View style={styles.container}>
      {/* Background pulse blob */}
      <PulseBlob />

      <ReceiptModal
        visible={showReceipt}
        onClose={() => setShowReceipt(false)}
        content={content}
        rental={rental}
      />

      <Animated.View style={[styles.inner, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>

        {/* ── Success icon ── */}
        <View style={styles.iconWrap}>
          <RippleRing />
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={44} color="#22c55e" />
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
              <Text style={styles.receiptGreen}>₹{rental.amountPaid}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Access Duration</Text>
              <Text style={styles.receiptValue}>{formatAccessDuration(rental)}</Text>
            </View>
          </View>
        </View>

        {/* ── Creator support banner ── */}
        <View style={styles.creatorBanner}>
          <Text style={styles.creatorText}>
            {Math.round(ENV.CREATOR_REVENUE_SHARE * 100)}% of your payment goes directly to the creator. Thank you for supporting independent cinema! 🎥
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
            <Ionicons name="play" size={20} color="#ffffff" />
            <Text style={styles.watchBtnText}>Watch Now</Text>
          </TouchableOpacity>

          {/* Receipt + Share */}
          <View style={styles.secondRow}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7} onPress={() => setShowReceipt(true)}>
              <Ionicons name="download-outline" size={18} color="#ffffff" />
              <Text style={styles.outlineBtnText}>Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#ffffff" />
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
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(34,197,94,0.4)',
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
;

const receiptStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#333333',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1f1f1f',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },

  // ── Paper ──
  paper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paperHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  brandTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  statusWrap: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    letterSpacing: 1,
  },

  contentRow: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbBox: {
    width: 60, height: 84, borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  contentMeta: { flex: 1, justifyContent: 'center', gap: 3 },
  contentTitle: { fontSize: 15, fontWeight: '700', color: '#111111', lineHeight: 20 },
  contentDir:   { fontSize: 12, color: '#666666' },
  contentGenre: { fontSize: 11, color: '#999999', marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginVertical: 4,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },

  // ReceiptRow
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111111', textAlign: 'right', flex: 1, marginLeft: 8 },
  rowValueGreen: { color: '#16a34a', fontSize: 15 },

  // Perforation
  perfWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  perfHoleL: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#0a0a0a',
    marginLeft: -11,
  },
  perfDashes: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 4,
  },
  perfDash: {
    width: 6, height: 2,
    backgroundColor: '#d1d5db',
    borderRadius: 1,
  },
  perfHoleR: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#0a0a0a',
    marginRight: -11,
  },

  // Footer
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  footerUrl: {
    fontSize: 11,
    color: '#c084fc',
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    fontWeight: '600',
  },

  // Share button
  shareBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    zIndex: 1,
  },
});
