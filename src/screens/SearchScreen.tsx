import React, { useRef, useState } from 'react';
import {
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
import { Content, mockContent } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';

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

// ─── Pure-View icons ──────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowShaft} />
      <View style={[iconStyles.arrowHead, iconStyles.arrowHeadTop]} />
      <View style={[iconStyles.arrowHead, iconStyles.arrowHeadBot]} />
    </View>
  );
}

function SearchIcon({ color = '#737373', size = 18 }: { color?: string; size?: number }) {
  const r = size * 0.38;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          borderWidth: 2,
          borderColor: color,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 2,
          height: size * 0.38,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function XIcon({ color = '#737373', size = 16 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

function ClockIcon() {
  return (
    <View style={iconStyles.clockWrap}>
      <View style={iconStyles.clockFace} />
      <View style={iconStyles.clockHour} />
      <View style={iconStyles.clockMin} />
    </View>
  );
}

function TrendingUpIcon() {
  return (
    <View style={iconStyles.trendWrap}>
      <View style={iconStyles.trendLine} />
      <View style={iconStyles.trendArrowV} />
      <View style={iconStyles.trendArrowH} />
    </View>
  );
}

// ─── Pill badge (trending tags) ───────────────────────────────────────────────
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
  const [query, setQuery]       = useState('');
  const [history, setHistory]   = useState<string[]>(RECENT_SEED);
  const inputRef                = useRef<TextInput>(null);

  // ── Search logic ───────────────────────────────────────────────────────────
  const results = query.trim()
    ? mockContent.filter(c => {
        const q = query.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.director.toLowerCase().includes(q) ||
          c.genre.toLowerCase().includes(q) ||
          c.language.toLowerCase().includes(q) ||
          c.mood.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim() && !history.includes(text.trim())) {
      setHistory(prev => [text.trim(), ...prev.slice(0, 4)]);
    }
  };

  const removeFromHistory = (idx: number) =>
    setHistory(prev => prev.filter((_, i) => i !== idx));

  const popularContent = [...mockContent]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* ── Sticky header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeftIcon />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <View style={styles.inputIcon}>
            <SearchIcon />
          </View>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search films, directors, genres..."
            placeholderTextColor="#525252"
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
              <XIcon color="#737373" size={16} />
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
              {results.length} {results.length === 1 ? 'Result' : 'Results'}
            </Text>
            {results.length > 0 ? (
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
                  <SearchIcon color="#525252" size={32} />
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
                    <ClockIcon />
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
                    <ClockIcon />
                    <Text style={styles.historyText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => removeFromHistory(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <XIcon color="#525252" size={14} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending searches */}
            <View style={styles.section}>
              <View style={styles.sectionRowLeft}>
                <TrendingUpIcon />
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
    backgroundColor: '#000000',
  },
  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#171717',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
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
    color: '#a3a3a3',
    letterSpacing: 0.2,
  },
  clearText: {
    fontSize: 12,
    color: '#737373',
  },
  // history rows
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#171717',
    borderRadius: 10,
  },
  historyText: {
    flex: 1,
    color: '#ffffff',
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
    backgroundColor: '#171717',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  trendBadgeText: {
    color: '#d4d4d4',
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
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#737373',
  },
});

// ─── Icon styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  // ── Back arrow ─────────────────────────────────────────────────────────────
  arrowWrap: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowShaft: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  arrowHead: {
    position: 'absolute',
    left: 0,
    width: 8,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  arrowHeadTop: {
    top: 5,
    transform: [{ rotate: '-45deg' }],
    transformOrigin: 'left center',
  },
  arrowHeadBot: {
    bottom: 5,
    transform: [{ rotate: '45deg' }],
    transformOrigin: 'left center',
  },
  // ── Clock ──────────────────────────────────────────────────────────────────
  clockWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#737373',
  },
  clockHour: {
    position: 'absolute',
    width: 1.5,
    height: 4,
    backgroundColor: '#737373',
    borderRadius: 1,
    top: 2,
    left: 7,
  },
  clockMin: {
    position: 'absolute',
    width: 1.5,
    height: 3,
    backgroundColor: '#737373',
    borderRadius: 1,
    top: 6,
    left: 7,
    transform: [{ rotate: '90deg' }],
  },
  // ── Trending up ────────────────────────────────────────────────────────────
  trendWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLine: {
    position: 'absolute',
    width: 13,
    height: 1.5,
    backgroundColor: '#737373',
    borderRadius: 1,
    bottom: 3,
    left: 1,
    transform: [{ rotate: '-25deg' }],
  },
  trendArrowV: {
    position: 'absolute',
    width: 1.5,
    height: 5,
    backgroundColor: '#737373',
    borderRadius: 1,
    top: 1,
    right: 2,
  },
  trendArrowH: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    backgroundColor: '#737373',
    borderRadius: 1,
    top: 1,
    right: 2,
  },
});
