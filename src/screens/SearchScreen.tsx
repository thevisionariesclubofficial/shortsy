import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Content } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { searchContent } from '../services/contentService';
import { getPopularContent } from '../services/discoveryService';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

// ─── Trending / recent seed data ─────────────────────────────────────────────
const TRENDING = [
  'Festival Winners',
  'Vertical Series',
  'Late Night',
  'Hindi Films',
  'Thriller',
  'Romance',
];
const RECENT_SEED = ['The Last Train', 'Midnight Caller'];

// ─── Pill badge (trending tags) ─────────────────────────────────────────────
function TrendBadge({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.trendBadge}>
        <Text style={styles.trendBadgeText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SearchScreenProps {
  onBack: () => void;
  onContentClick: (content: Content) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SearchScreen({ onBack, onContentClick }: SearchScreenProps) {
  const [query, setQuery]                   = useState('');
  const [history, setHistory]               = useState<string[]>(RECENT_SEED);
  const [results, setResults]               = useState<Content[]>([]);
  const [searching, setSearching]           = useState(false);
  const [popularContent, setPopularContent] = useState<Content[]>([]);
  const inputRef                            = useRef<TextInput>(null);

  // ── Load popular content once on mount ────────────────────────────────────
  useEffect(() => {
    getPopularContent(6)
      .then(setPopularContent)
      .catch(() => {});
  }, []);

  // ── Debounced search (300ms) ───────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchContent({ q: query.trim() })
        .then(res => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim() && !history.includes(text.trim())) {
      setHistory(prev => [text.trim(), ...prev.slice(0, 4)]);
    }
  };

  const removeFromHistory = (idx: number) =>
    setHistory(prev => prev.filter((_, i) => i !== idx));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* ── Sticky header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <View style={styles.inputIcon}>
            <Ionicons name="search" size={18} color={COLORS.text.muted} />
          </View>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search films, directors, genres..."
            placeholderTextColor={COLORS.text.dimmed}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.text.dimmed} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Results ── */}
        {query.trim() !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {searching
                ? 'Searching...'
                : `${results.length} ${results.length === 1 ? 'Result' : 'Results'}`
              }
            </Text>
            {searching ? (
              <ActivityIndicator size="small" color={COLORS.brand.violet} style={{ marginTop: 8 }} />
            ) : results.length > 0 ? (
              <View style={styles.grid}>
                {results.map(c => (
                  <View key={c.id} style={styles.gridItem}>
                    <ContentCard content={c} onClick={() => onContentClick(c)} />
                  </View>
                ))}
              </View>
            ) : (
              /* ── Empty state ── */
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search" size={32} color={COLORS.text.dimmed} />
                </View>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>Try searching for different keywords</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Idle state ── */}
        {query.trim() === '' && (
          <>
            {/* Recent searches */}
            {history.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <View style={styles.sectionRowLeft}>
                    <Ionicons name="time-outline" size={16} color={COLORS.text.muted} />
                    <Text style={styles.sectionLabel}>Recent Searches</Text>
                  </View>
                  <TouchableOpacity onPress={() => setHistory([])} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {history.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.historyRow}
                    onPress={() => handleSearch(item)}
                    activeOpacity={0.7}>
                    <Ionicons name="time-outline" size={16} color={COLORS.text.muted} />
                    <Text style={styles.historyText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => removeFromHistory(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={14} color={COLORS.text.dimmed} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending searches */}
            <View style={styles.section}>
              <View style={styles.sectionRowLeft}>
                <Ionicons name="trending-up" size={16} color={COLORS.text.muted} />
                <Text style={styles.sectionLabel}>Trending Searches</Text>
              </View>
              <View style={styles.trendWrap}>
                {TRENDING.map((t, i) => (
                  <TrendBadge key={i} label={t} onPress={() => handleSearch(t)} />
                ))}
              </View>
            </View>

            {/* Popular this week */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Popular This Week</Text>
              <View style={styles.grid}>
                {popularContent.map(c => (
                  <View key={c.id} style={styles.gridItem}>
                    <ContentCard content={c} onClick={() => onContentClick(c)} />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_GAP = 10;
const CARD_W   = (width - 32 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: COLORS.overlay.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.bg.card,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: 6,
  },
  // scroll body
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  // sections
  section: {
    gap: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 0.2,
  },
  clearText: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  // history rows
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.bg.card,
    borderRadius: 10,
  },
  historyText: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  // trending badges
  trendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: COLORS.bg.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  trendBadgeText: {
    color: COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  // grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  gridItem: {
    width: CARD_W,
  },
  // empty
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
});

