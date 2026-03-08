import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Content } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { clearContentCache, listContent } from '../services/contentService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────
type TypeFilter = 'all' | 'short-film' | 'vertical-series';

interface GenreDetailScreenProps {
  genre: { id: string; name: string; emoji: string };
  onBack: () => void;
  onContentClick: (content: Content) => void;
}

// ─── Pill badge ───────────────────────────────────────────────────────────────
function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GenreDetailScreen({ genre, onBack, onContentClick }: GenreDetailScreenProps) {
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');

  // ── Service-fetched state ─────────────────────────────────────────────────
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    clearContentCache();
    setRefreshing(true);
    try {
      const allRes = await listContent({ genre: genre.name });
      setAllContent(allRes.data);
    } catch (err) {
      console.error('[GenreDetailScreen] Pull-to-refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [genre.name]);

  useEffect(() => {
    async function fetchGenreContent() {
      try {
        const allRes = await listContent({ genre: genre.name });
        setAllContent(allRes.data);
      } catch (err) {
        console.error('[GenreDetailScreen] Failed to fetch genre content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGenreContent();
  }, [genre.name]);

  // Client-side filtering by type
  const filtered = allContent.filter(c => {
    if (selectedType !== 'all' && c.type !== selectedType) return false;
    return true;
  });

  // Split into rows of 2 for the grid
  const rows: Content[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Sticky header ── */}
      <View style={styles.header}>
        {/* Top bar */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerEmoji}>{genre.emoji}</Text>
            <Text style={styles.headerTitle}>{genre.name}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Type chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeRow}>
          <Pill label="All" active={selectedType === 'all'} onPress={() => setSelectedType('all')} />
          <Pill label="Short Films" active={selectedType === 'short-film'} onPress={() => setSelectedType('short-film')} />
          <Pill label="Vertical Series" active={selectedType === 'vertical-series'} onPress={() => setSelectedType('vertical-series')} />
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.brand.violet}
            colors={[COLORS.brand.violet]}
          />
        }>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brand.violet} />
          </View>
        ) : (
          <>
            {/* ── Results count ── */}
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </Text>
            </View>

            {/* ── Grid ── */}
            {rows.length > 0 ? (
              rows.map((row, ri) => (
                <View key={ri} style={styles.row}>
                  {row.map(content => (
                    <View key={content.id} style={styles.cardWrap}>
                      <ContentCard content={content} onClick={() => onContentClick(content)} />
                    </View>
                  ))}
                  {/* Fill empty slot if odd */}
                  {row.length === 1 && <View style={styles.cardWrap} />}
                </View>
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No {genre.name.toLowerCase()} content found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: COLORS.overlay.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bg.elevated,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  pillActive: {
    backgroundColor: COLORS.brand.violet,
    borderColor: COLORS.brand.violet,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  pillTextActive: {
    color: COLORS.text.primary,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  countRow: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cardWrap: {
    flex: 1,
  },
  empty: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.dimmed,
  },
});

