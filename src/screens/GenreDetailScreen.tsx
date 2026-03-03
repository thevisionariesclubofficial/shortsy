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

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <View style={iconStyles.backWrap}>
      <View style={iconStyles.chevronTop} />
      <View style={iconStyles.chevronBottom} />
    </View>
  );
}

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
            <BackIcon />
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
            tintColor="#a855f7"
            colors={['#a855f7']}
          />
        }>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a855f7" />
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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
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
    color: '#ffffff',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
  },
  pillActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#737373',
  },
  pillTextActive: {
    color: '#ffffff',
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
    color: '#737373',
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
    color: '#525252',
  },
});

const iconStyles = StyleSheet.create({
  backWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronTop: {
    position: 'absolute',
    width: 10,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    right: 6,
    top: 6,
    transform: [{ rotate: '-45deg' }],
  },
  chevronBottom: {
    position: 'absolute',
    width: 10,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    right: 6,
    bottom: 6,
    transform: [{ rotate: '45deg' }],
  },
});
