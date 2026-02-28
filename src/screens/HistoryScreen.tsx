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

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={iconStyles.arrowTop} />
      <View style={iconStyles.arrowBottom} />
    </View>
  );
}

function FilmRollIcon() {
  return (
    <View style={iconStyles.filmOuter}>
      <View style={iconStyles.filmStripLeft}>
        {[0, 1, 2].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={iconStyles.filmPlay} />
      </View>
      <View style={iconStyles.filmStripRight}>
        {[0, 1, 2].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
    </View>
  );
}

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
        colors={['#0d001a', '#000000']}
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
          <ArrowLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch History</Text>
        {/* spacer to centre the title */}
        <View style={{ width: 40 }} />
      </View>

      {rentedContent.length === 0 ? (
        // ── Empty state ──
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <FilmRollIcon />
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
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
    backgroundColor: '#1a0533',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#737373',
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
    color: '#737373',
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

const iconStyles = StyleSheet.create({
  // Arrow left
  arrowWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowStem: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  arrowTop: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    left: 3,
    top: 5,
    transform: [{ rotate: '-45deg' }],
  },
  arrowBottom: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    left: 3,
    bottom: 5,
    transform: [{ rotate: '45deg' }],
  },
  // Film roll (empty state)
  filmOuter: {
    width: 40,
    height: 30,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#a855f7',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filmStripLeft: {
    width: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#a855f7',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmStripRight: {
    width: 8,
    borderLeftWidth: 1.5,
    borderLeftColor: '#a855f7',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmHole: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#a855f7',
  },
  filmPlay: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#a855f7',
  },
});
