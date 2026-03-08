import { Ionicons } from '@react-native-vector-icons/ionicons';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Content } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { COLORS } from '../constants/colors';

// ─── Props ────────────────────────────────────────────────────────────────────
interface HistoryScreenProps {
  rentedContent: Content[];
  onBack: () => void;
  onContentClick: (content: Content) => void;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function HistoryScreen({
  rentedContent,
  onBack,
  onContentClick,
}: HistoryScreenProps) {
  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.bg.onboardingStart, COLORS.bg.black]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch History</Text>
        {/* spacer to centre the title */}
        <View style={{ width: 40 }} />
      </View>

      {rentedContent.length === 0 ? (
        // ── Empty state ──
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="film-outline" size={32} color={COLORS.brand.violet} />
          </View>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySubtitle}>
            Rent a short film or series to get started.
          </Text>
        </View>
      ) : (
        // ── Content grid ──
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.countLabel}>
            {rentedContent.length} title{rentedContent.length !== 1 ? 's' : ''} rented
          </Text>
          <View style={styles.grid}>
            {(() => {
              const rows: Content[][] = [];
              for (let i = 0; i < rentedContent.length; i += 2) {
                rows.push(rentedContent.slice(i, i + 2));
              }
              return rows.map((row, ri) => (
                <View key={ri} style={styles.row}>
                  {row.map(c => (
                    <View key={c.id} style={styles.cardWrap}>
                      <ContentCard content={c} onClick={() => onContentClick(c)} />
                    </View>
                  ))}
                  {row.length === 1 && <View style={styles.cardWrap} />}
                </View>
              ));
            })()}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.elevated,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg.subtle,
    borderRadius: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  // ── Empty state ──
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bg.heroStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 21,
  },
  // ── Grid ──
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  countLabel: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrap: {
    flex: 1,
  },
});

