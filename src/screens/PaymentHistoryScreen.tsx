import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import type { Content } from '../data/mockData';
import { getContentDetail } from '../services/contentService';
import type { PaymentHistoryRecord } from '../types/api';
import { COLORS } from '../constants/colors';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function resolveStatus(status: string): { color: string; label: string; dotColor: string } {
  switch (status) {
    case 'paid':    return { color: COLORS.accent.green700, label: 'PAYMENT CONFIRMED', dotColor: COLORS.accent.green };
    case 'pending': return { color: COLORS.accent.amber600, label: 'PAYMENT PENDING',   dotColor: COLORS.accent.gold };
    case 'failed':  return { color: COLORS.accent.red600, label: 'PAYMENT FAILED',    dotColor: COLORS.accent.red };
    default:        return { color: COLORS.text.gray500, label: status.toUpperCase(), dotColor: COLORS.text.gray500 };
  }
}

function typeLabel(content: Content): string {
  if (content.type === 'short-film') { return 'Short Film'; }
  if (content.type === 'vertical-series') { return 'Series'; }
  return content.type;
}

// ─── Formatted text receipt (shared via native share sheet) ─────────────────
function buildShareText(order: PaymentHistoryRecord, content?: Content): string {
  const si = resolveStatus(order.status);
  const tl = content ? typeLabel(content) : '';
  const bar = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const div = '─────────────────────────────────';
  return [
    bar,
    '         SHORTSY  RECEIPT         ',
    bar,
    '',
    content?.title  ? `Title    : ${content.title}`  : `Content  : ${order.contentId}`,
    ...(content
      ? [
          `Category : ${[content.genre, tl].filter(Boolean).join(' · ')}`,
          ...(content.director ? [`Director : ${content.director}`] : []),
        ]
      : []),
    '',
    `Amount   : ₹${order.amountINR}`,
    `Status   : ${si.label}`,
    `Date     : ${fmt(order.createdAt)}`,
    '',
    div,
    `Order    : ${order.orderId}`,
    ...(order.gatewayOrderId   ? [`Gateway  : ${order.gatewayOrderId}`]   : []),
    ...(order.gatewayPaymentId ? [`Payment  : ${order.gatewayPaymentId}`] : []),
    ...(order.transactionId    ? [`Txn ID   : ${order.transactionId}`]    : []),
    div,
    '',
    'Thank you for supporting independent cinema! 🎬',
    'shortsy.app',
    bar,
  ].join('\n');
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={receiptStyles.row}>
      <Text style={receiptStyles.rowLabel}>{label}</Text>
      <Text style={[receiptStyles.rowValue, mono && receiptStyles.rowMono]} numberOfLines={1} ellipsizeMode="middle">
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

// ─── Receipt Modal ────────────────────────────────────────────────────────────
interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  order: PaymentHistoryRecord;
  content?: Content;
}

function ReceiptModal({ visible, onClose, order, content }: ReceiptModalProps) {
  const [sharing, setSharing] = useState(false);
  const paperRef = useRef<View>(null);
  const si = resolveStatus(order.status);
  const tl = content ? typeLabel(content) : '';

  const statusBarStyle =
    order.status === 'paid'    ? receiptStyles.statusPaid :
    order.status === 'pending' ? receiptStyles.statusPending :
                                  receiptStyles.statusFailed;

  const handleShare = async () => {
    setSharing(true);
    try {
      const uri = await captureRef(paperRef, { format: 'png', quality: 1 });
      await Share.share({
        url: uri,
        title: `Shortsy Receipt – ${content?.title ?? order.orderId}`,
        ...(Platform.OS === 'android' ? { message: uri } : {}),
      });
    } catch (err) {
      console.warn('[Receipt] Image capture error:', err);
    }
    setSharing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={receiptStyles.modalRoot}>
        <View style={receiptStyles.handle} />

        <View style={receiptStyles.modalHeader}>
          <Text style={receiptStyles.modalTitle}>Receipt</Text>
          <TouchableOpacity onPress={onClose} style={receiptStyles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={receiptStyles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Receipt paper ── */}
          <View ref={paperRef} style={receiptStyles.paper}>

            {/* Brand header */}
            <LinearGradient colors={[COLORS.brand.primaryDark, COLORS.brand.pinkDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={receiptStyles.paperHeader}>
              <Text style={receiptStyles.brandName}>SHORTSY</Text>
              <Text style={receiptStyles.brandTagline}>Indie Cinema Platform</Text>
            </LinearGradient>

            {/* Status badge */}
            <View style={[receiptStyles.statusWrap, statusBarStyle]}>
              <View style={receiptStyles.statusBadge}>
                <View style={[receiptStyles.statusDot, { backgroundColor: si.dotColor }]} />
                <Text style={[receiptStyles.statusText, { color: si.color }]}>{si.label}</Text>
              </View>
            </View>

            {/* Content thumbnail + info */}
            <View style={receiptStyles.contentRow}>
              <View style={receiptStyles.thumbBox}>
                <LinearGradient colors={[COLORS.accent.indigoDark, COLORS.accent.indigo700]} style={StyleSheet.absoluteFill} />
                {content?.thumbnail
                  ? <Image source={{ uri: content.thumbnail }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  : null}
              </View>
              <View style={receiptStyles.contentMeta}>
                <Text style={receiptStyles.contentTitle} numberOfLines={2}>{content?.title ?? order.contentId}</Text>
                {content?.director ? <Text style={receiptStyles.contentDir}>{content.director}</Text> : null}
                {content
                  ? <Text style={receiptStyles.contentGenre}>{[content.genre, tl].filter(Boolean).join(' · ')}</Text>
                  : null}
              </View>
            </View>

            {/* Amount banner */}
            <View style={receiptStyles.amountBanner}>
              <Text style={receiptStyles.amountVal}>₹{order.amountINR}</Text>
              <Text style={receiptStyles.amountLbl}>Amount Paid</Text>
            </View>

            <View style={receiptStyles.divider} />

            {/* Transaction details */}
            <Text style={receiptStyles.sectionLabel}>TRANSACTION DETAILS</Text>
            <ReceiptRow label="Date"          value={fmt(order.createdAt)} />
            <ReceiptRow label="Order ID"      value={order.orderId}         mono />
            {order.gatewayOrderId   ? <ReceiptRow label="Gateway Order" value={order.gatewayOrderId}   mono /> : null}
            {order.gatewayPaymentId ? <ReceiptRow label="Payment ID"    value={order.gatewayPaymentId} mono /> : null}
            {order.transactionId    ? <ReceiptRow label="Transaction"   value={order.transactionId}    mono /> : null}

            <Perforation />

            <Text style={receiptStyles.footerNote}>
              {'Thank you for supporting independent cinema! 🎬\nThis receipt is your proof of purchase. Keep it safe.'}
            </Text>
            <Text style={receiptStyles.footerUrl}>shortsy.app</Text>
          </View>

          {/* PDF share button */}
          <TouchableOpacity style={receiptStyles.shareBtn} onPress={handleShare} activeOpacity={0.85} disabled={sharing}>
            <LinearGradient colors={[COLORS.brand.primaryDark, COLORS.brand.pinkDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
            <Ionicons name="image-outline" size={18} color={COLORS.text.primary} />
            <Text style={receiptStyles.shareBtnText}>{sharing ? 'Capturing…' : 'Save / Share as Image'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface PaymentHistoryScreenProps {
  onBack: () => void;
  paymentHistory: PaymentHistoryRecord[];
  onRefreshPaymentHistory: () => Promise<void>;
}

export function PaymentHistoryScreen({ onBack, paymentHistory, onRefreshPaymentHistory }: PaymentHistoryScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [contentMap, setContentMap] = useState<Record<string, Content>>({});
  const [activeReceipt, setActiveReceipt] = useState<{ order: PaymentHistoryRecord; content?: Content } | null>(null);

  // Fetch content details (title, thumbnail, genre) for each unique contentId
  useEffect(() => {
    const uniqueIds = [...new Set(paymentHistory.map(o => o.contentId))];
    if (uniqueIds.length === 0) { return; }
    Promise.all(
      uniqueIds.map(id =>
        getContentDetail(id)
          .then(c => ({ id, content: c as Content }))
          .catch(() => null),
      ),
    ).then(results => {
      const map: Record<string, Content> = {};
      results.forEach(r => { if (r) { map[r.id] = r.content; } });
      setContentMap(map);
    });
  }, [paymentHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshPaymentHistory();
    } catch (err) {
      console.error('Failed to refresh payment history:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':    return <Ionicons name="checkmark-circle" size={16} color={COLORS.accent.emerald} />;
      case 'pending': return <Ionicons name="time-outline"     size={16} color={COLORS.accent.gold} />;
      case 'failed':  return <Ionicons name="close-circle"     size={16} color={COLORS.accent.red} />;
      default:        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':    return COLORS.accent.emerald;
      case 'pending': return COLORS.accent.gold;
      case 'failed':  return COLORS.accent.red;
      default:        return COLORS.text.gray500;
    }
  };

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <View style={styles.container}>
      {activeReceipt && (
        <ReceiptModal
          visible={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          order={activeReceipt.order}
          content={activeReceipt.content}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {paymentHistory.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.brand.violet}
              colors={[COLORS.brand.violet]}
            />
          }>
          <Text style={styles.emptyText}>No payment history yet</Text>
          <Text style={styles.emptySubtext}>
            Your rental transactions will appear here
          </Text>
          <Text style={styles.pullToRefreshHint}>Pull down to refresh</Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.brand.violet}
              colors={[COLORS.brand.violet]}
            />
          }>
          <Text style={styles.countText}>
            {paymentHistory.length} {paymentHistory.length === 1 ? 'transaction' : 'transactions'}
          </Text>

          {[...paymentHistory]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order) => {
            const content = contentMap[order.contentId];
            return (
            <View key={order.orderId} style={styles.card}>
              {/* ── Hero thumbnail ── */}
              {content?.thumbnail ? (
                <Image source={{ uri: content.thumbnail }} style={styles.heroThumb} resizeMode="cover" />
              ) : (
                <View style={styles.heroPlaceholder}>
                  <Ionicons name="film-outline" size={40} color={COLORS.text.gray700} />
                </View>
              )}

              {/* ── Card body ── */}
              <View style={styles.cardBody}>
                {/* Title + Amount */}
                <View style={styles.titleRow}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {content?.title ?? order.contentId}
                  </Text>
                  <Text style={styles.amountText}>₹{order.amountINR}</Text>
                </View>

                {/* Genre/type + Status badge */}
                <View style={styles.metaRow}>
                  {content ? (
                    <Text style={styles.contentMeta} numberOfLines={1}>
                      {[content.genre, content.type === 'short-film' ? 'Short Film' : content.type === 'vertical-series' ? 'Series' : content.type]
                        .filter(Boolean).join(' · ')}
                    </Text>
                  ) : <View />}
                  <View style={styles.statusBadge}>
                    {getStatusIcon(order.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>

                <View style={styles.cardDivider} />

                {/* Compact IDs */}
                <View style={styles.idsBlock}>
                  <View style={styles.idRow}>
                    <Text style={styles.idLabel}>Order</Text>
                    <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">{order.orderId}</Text>
                  </View>
                  {order.gatewayOrderId ? (
                    <View style={styles.idRow}>
                      <Text style={styles.idLabel}>Gateway</Text>
                      <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">{order.gatewayOrderId}</Text>
                    </View>
                  ) : null}
                  {order.gatewayPaymentId ? (
                    <View style={styles.idRow}>
                      <Text style={styles.idLabel}>Payment</Text>
                      <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">{order.gatewayPaymentId}</Text>
                    </View>
                  ) : null}
                  {order.transactionId ? (
                    <View style={styles.idRow}>
                      <Text style={styles.idLabel}>Txn</Text>
                      <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">{order.transactionId}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.cardDivider} />

                {/* View Receipt button */}
                <TouchableOpacity
                  style={styles.receiptBtn}
                  onPress={() => setActiveReceipt({ order, content })}
                  activeOpacity={0.75}>
                  <Ionicons name="receipt-outline" size={15} color={COLORS.brand.violet} />
                  <Text style={styles.receiptBtnText}>View &amp; Download Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.bg.black,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.text.gray400,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.accent.red,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.brand.violet,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.gray400,
    textAlign: 'center',
  },
  pullToRefreshHint: {
    fontSize: 12,
    color: COLORS.text.gray500,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  countText: {
    fontSize: 14,
    color: COLORS.text.gray400,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.bg.elevated,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.muted,
    overflow: 'hidden',
  },
  heroThumb: {
    width: '100%',
    height: 170,
  },
  heroPlaceholder: {
    width: '100%',
    height: 170,
    backgroundColor: COLORS.bg.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 5,
  },
  contentTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 21,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 12,
    color: COLORS.text.gray400,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.text.gray500,
    marginBottom: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border.muted,
    marginVertical: 10,
  },
  idsBlock: {
    gap: 5,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 10,
    color: COLORS.text.gray500,
    width: 54,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  idValue: {
    flex: 1,
    fontSize: 10,
    color: COLORS.text.gray400,
    textAlign: 'right',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.brand.primaryDark,
    backgroundColor: COLORS.overlay.violetTint08,
  },
  receiptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand.violet,
  },
});

// ─── Receipt Modal Styles ─────────────────────────────────────────────────────
const receiptStyles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: COLORS.bg.dark, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border.handle, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bg.elevated },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.text.primary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bg.modal, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, gap: 16 },

  // Paper
  paper: { backgroundColor: COLORS.text.primary, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  paperHeader: { paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center', gap: 4 },
  brandName: { fontSize: 24, fontWeight: '900', color: COLORS.text.primary, letterSpacing: 4 },
  brandTagline: { fontSize: 11, color: COLORS.overlay.brandTagline, letterSpacing: 1, textTransform: 'uppercase' },

  // Status
  statusWrap: { alignItems: 'center', paddingVertical: 14 },
  statusPaid:    { backgroundColor: COLORS.receipt.statusPaidBg, borderBottomWidth: 1, borderBottomColor: COLORS.receipt.statusPaidBorder },
  statusPending: { backgroundColor: COLORS.receipt.statusPendingBg, borderBottomWidth: 1, borderBottomColor: COLORS.receipt.statusPendingBorder },
  statusFailed:  { backgroundColor: COLORS.receipt.statusFailedBg, borderBottomWidth: 1, borderBottomColor: COLORS.receipt.statusFailedBorder },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  // Content row
  contentRow: { flexDirection: 'row', gap: 14, padding: 16, backgroundColor: COLORS.receipt.bgLight, borderBottomWidth: 1, borderBottomColor: COLORS.receipt.divider },
  thumbBox: { width: 60, height: 84, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.bg.elevated },
  contentMeta: { flex: 1, justifyContent: 'center', gap: 3 },
  contentTitle: { fontSize: 15, fontWeight: '700', color: COLORS.bg.subtle, lineHeight: 20 },
  contentDir: { fontSize: 12, color: COLORS.receipt.textMid },
  contentGenre: { fontSize: 11, color: COLORS.receipt.textLight, marginTop: 2 },

  // Amount
  amountBanner: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.receipt.divider },
  amountVal: { fontSize: 34, fontWeight: '900', color: COLORS.bg.subtle },
  amountLbl: { fontSize: 10, color: COLORS.text.gray400, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  divider: { height: 1, backgroundColor: COLORS.receipt.divider, marginHorizontal: 16, marginVertical: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: COLORS.text.gray400, letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },

  // Rows
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7 },
  rowLabel: { fontSize: 13, color: COLORS.text.gray500 },
  rowValue: { fontSize: 13, fontWeight: '600', color: COLORS.bg.subtle, textAlign: 'right', flex: 1, marginLeft: 8 },
  rowMono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 10, color: COLORS.text.gray600 },

  // Perforation
  perfWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 4 },
  perfHoleL: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.bg.dark, marginLeft: -11 },
  perfDashes: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 4 },
  perfDash: { width: 6, height: 2, backgroundColor: COLORS.border.gray300, borderRadius: 1 },
  perfHoleR: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.bg.dark, marginRight: -11 },

  // Footer
  footerNote: { fontSize: 12, color: COLORS.text.gray400, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20, paddingTop: 14 },
  footerUrl: { fontSize: 11, color: COLORS.brand.violetMuted, textAlign: 'center', paddingTop: 4, paddingBottom: Platform.OS === 'ios' ? 20 : 16, fontWeight: '600' },

  // Share button
  shareBtn: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, zIndex: 1 },
});
