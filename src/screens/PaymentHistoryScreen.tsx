import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { PaymentHistoryRecord } from '../types/api';

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackArrowIcon() {
  return (
    <View style={iconStyles.backArrow}>
      <View style={iconStyles.backArrowLine} />
      <View style={iconStyles.backArrowTop} />
      <View style={iconStyles.backArrowBottom} />
    </View>
  );
}

function CheckCircleIcon() {
  return (
    <View style={iconStyles.checkCircle}>
      <View style={iconStyles.checkMark} />
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={iconStyles.clockCircle}>
      <View style={iconStyles.clockHand} />
    </View>
  );
}

function XCircleIcon() {
  return (
    <View style={iconStyles.xCircle}>
      <View style={iconStyles.xLine1} />
      <View style={iconStyles.xLine2} />
    </View>
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
      case 'paid':
        return <CheckCircleIcon />;
      case 'pending':
        return <ClockIcon />;
      case 'failed':
        return <XCircleIcon />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackArrowIcon />
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
              tintColor="#a855f7"
              colors={['#a855f7']}
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
              tintColor="#a855f7"
              colors={['#a855f7']}
            />
          }>
          <Text style={styles.countText}>
            {paymentHistory.length} {paymentHistory.length === 1 ? 'transaction' : 'transactions'}
          </Text>

          {paymentHistory.map((order) => (
            <View key={order.orderId} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.statusBadge}>
                  {getStatusIcon(order.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.amountText}>₹{order.amountINR}</Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {order.orderId}
                </Text>
              </View>

              {order.transactionId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {order.transactionId}
                  </Text>
                </View>
              )}

              {order.gatewayPaymentId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment ID</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {order.gatewayPaymentId}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gateway Order ID</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {order.gatewayOrderId}
                </Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Created</Text>
                <Text style={styles.dateValue}>{formatDate(order.createdAt)}</Text>
              </View>

              {order.updatedAt !== order.createdAt && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Updated</Text>
                  <Text style={styles.dateValue}>{formatDate(order.updatedAt)}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000',
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
    color: '#fff',
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
    color: '#9ca3af',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#a855f7',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  pullToRefreshHint: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#9ca3af',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9ca3af',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

// ─── Icon Styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  backArrow: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  backArrowLine: {
    position: 'absolute',
    left: 2,
    top: 9,
    width: 16,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  backArrowTop: {
    position: 'absolute',
    left: 2,
    top: 5,
    width: 8,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  backArrowBottom: {
    position: 'absolute',
    left: 2,
    top: 13,
    width: 8,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    width: 8,
    height: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  clockCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    width: 1.5,
    height: 5,
    backgroundColor: '#f59e0b',
    marginBottom: 2,
  },
  xCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
