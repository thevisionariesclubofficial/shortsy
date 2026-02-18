import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';

// Deterministic bg colours per genre (image placeholder)
const GENRE_COLORS: Record<string, [string, string, string]> = {
  Drama:          ['#2e1065', '#4c1d95', '#7c3aed'],
  Thriller:       ['#0c0a09', '#1c1917', '#92400e'],
  'Musical Drama':['#4a0d2e', '#831843', '#be185d'],
  Comedy:         ['#052e16', '#14532d', '#16a34a'],
  Romance:        ['#4c0519', '#881337', '#e11d48'],
  'Sci-Fi':       ['#082f49', '#0c4a6e', '#0284c7'],
  default:        ['#0f0e30', '#1e1b4b', '#4338ca'],
};

// ─── Play button icon ─────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <View style={playStyles.circle}>
      {/* Triangle pointing right */}
      <View style={playStyles.triangle} />
    </View>
  );
}

// ─── Star icon ────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <View style={starStyles.wrap}>
      {/* 5-point star approximated with two overlapping rotated rectangles */}
      <View style={[starStyles.bar, starStyles.barH]} />
      <View style={[starStyles.bar, starStyles.barD1]} />
      <View style={[starStyles.bar, starStyles.barD2]} />
    </View>
  );
}

interface ContentCardProps {
  content: Content;
  onClick: () => void;
}

export function ContentCard({ content, onClick }: ContentCardProps) {
  const [c1, c2, c3] = GENRE_COLORS[content.genre] ?? GENRE_COLORS.default;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [imgError, setImgError] = useState(false);

  const handlePressIn = () =>
    Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      onPress={onClick}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.card}
      activeOpacity={1}>

      {/* ── Thumbnail (2:3 aspect) ── */}
      <View style={styles.thumb}>
        <LinearGradient
          colors={[c1, c2, c3]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Decorative circle */}
        <View style={styles.thumbCircle} />

        {/* Actual thumbnail image */}
        {!imgError && content.thumbnail ? (
          <Image
            source={{ uri: content.thumbnail }}
            style={styles.thumbImage}
            onError={() => setImgError(true)}
          />
        ) : null}

        {/* Hover/press overlay with play button */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <LinearGradient
            colors={['transparent', '#000000cc']}
            style={StyleSheet.absoluteFill}
          />
          <PlayIcon />
        </Animated.View>

        {/* Top-left: Winner + Vertical badges */}
        <View style={styles.topLeft}>
          {content.festivalWinner && (
            <View style={[styles.badge, styles.badgeAmber]}>
              <Text style={styles.badgeText}>🏆 Winner</Text>
            </View>
          )}
          {content.type === 'vertical-series' && (
            <View style={[styles.badge, styles.badgePurple]}>
              <Text style={styles.badgeText}>Vertical</Text>
            </View>
          )}
        </View>

        {/* Top-right: Price */}
        <View style={styles.topRight}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{content.price}</Text>
          </View>
        </View>
      </View>

      {/* ── Info ── */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{content.title}</Text>

        <View style={styles.ratingRow}>
          <StarIcon />
          <Text style={styles.ratingText}>{content.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.durationText}>{content.duration}</Text>
        </View>

        <Text style={styles.language}>{content.language}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0d0d0d',
  },
  thumb: {
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumbCircle: {
    position: 'absolute',
    width: '80%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: '#ffffff08',
    top: '-20%',
    right: '-20%',
  },
  thumbImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  topRight: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeAmber: {
    backgroundColor: '#b45309',
  },
  badgePurple: {
    backgroundColor: '#7c3aed',
  },
  badgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: '#000000b0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  info: {
    padding: 8,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#737373',
  },
  dot: {
    fontSize: 11,
    color: '#404040',
  },
  durationText: {
    fontSize: 11,
    color: '#737373',
  },
  language: {
    fontSize: 11,
    color: '#525252',
  },
});

const playStyles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ffffff',
    marginLeft: 3,
  },
});

const starStyles = StyleSheet.create({
  wrap: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 1,
  },
  barH: {
    width: 12,
    height: 2,
  },
  barD1: {
    transform: [{ rotate: '45deg' }],
  },
  barD2: {
    transform: [{ rotate: '-45deg' }],
  },
});
