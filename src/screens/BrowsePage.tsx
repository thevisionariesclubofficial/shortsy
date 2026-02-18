import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Content, genres, languages, mockContent } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';

// ─── Icons ────────────────────────────────────────────────────────────────────
function FilterIcon() {
  return (
    <View style={iconStyles.filterWrap}>
      <View style={iconStyles.filterLine1} />
      <View style={iconStyles.filterLine2} />
      <View style={iconStyles.filterLine3} />
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TypeFilter = 'all' | 'short-film' | 'vertical-series';

interface BrowsePageProps {
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
export function BrowsePage({ onContentClick }: BrowsePageProps) {
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockContent.filter(c => {
    if (selectedType !== 'all' && c.type !== selectedType) return false;
    if (selectedGenre !== 'All' && c.genre !== selectedGenre) return false;
    if (selectedLanguage !== 'All' && c.language !== selectedLanguage) return false;
    return true;
  });

  // Split into rows of 2 for the grid
  const rows: Content[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {/* ── Sticky header ── */}
      <View style={styles.header}>
        {/* Top bar */}
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Browse</Text>
          <TouchableOpacity
            onPress={() => setShowFilters(v => !v)}
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
            activeOpacity={0.7}>
            <FilterIcon />
          </TouchableOpacity>
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
        contentContainerStyle={styles.scroll}>

        {/* ── Filter panel ── */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterSectionLabel}>Genre</Text>
            <View style={styles.pillWrap}>
              {genres.map(g => (
                <Pill key={g} label={g} active={selectedGenre === g} onPress={() => setSelectedGenre(g)} />
              ))}
            </View>

            <Text style={[styles.filterSectionLabel, { marginTop: 16 }]}>Language</Text>
            <View style={styles.pillWrap}>
              {languages.map(l => (
                <Pill key={l} label={l} active={selectedLanguage === l} onPress={() => setSelectedLanguage(l)} />
              ))}
            </View>
          </View>
        )}

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
            <Text style={styles.emptyText}>No content found with selected filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#4c1d95',
  },
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  scroll: {
    paddingBottom: 100,
  },
  filterPanel: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 13,
    color: '#737373',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  cardWrap: {
    flex: 1,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#525252',
  },
  // shared pill
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  pillActive: {
    backgroundColor: '#7c3aed',
  },
  pillText: {
    fontSize: 13,
    color: '#737373',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#ffffff',
  },
});

const iconStyles = StyleSheet.create({
  filterWrap: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  filterLine1: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 0,
  },
  filterLine2: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 2,
  },
  filterLine3: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 5,
  },
});
