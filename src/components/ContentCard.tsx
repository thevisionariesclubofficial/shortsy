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
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Content } from '../data/mockData';
import { COLORS } from '../constants/colors';

// Deterministic bg colours per genre (image placeholder)
const GENRE_COLORS: Record<string, [string, string, string]> = {
  Drama:          [COLORS.accent.violet950, COLORS.accent.violet900, COLORS.brand.primaryDark],
  Thriller:       [COLORS.bg.stoneBlack, COLORS.bg.stone900, COLORS.accent.amber800],
  'Musical Drama':[COLORS.accent.pinkDark, COLORS.accent.pink900, COLORS.accent.rose700],
  Comedy:         [COLORS.accent.greenDark, COLORS.accent.green900, COLORS.accent.green700],
  Romance:        [COLORS.accent.rose950, COLORS.accent.rose900, COLORS.accent.rose600],
  'Sci-Fi':       [COLORS.accent.sky950, COLORS.accent.sky900, COLORS.accent.sky600],
  default:        [COLORS.bg.splash, COLORS.accent.indigoDark, COLORS.accent.indigo700],
};

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
            colors={['transparent', COLORS.overlay.dark]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.playCircle}>
            <Ionicons name="play" size={18} color={COLORS.text.primary} />
          </View>
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
        {/* <View style={styles.topRight}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{content.price}</Text>
          </View>
        </View> */}
      </View>

      {/* ── Info ── */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{content.title}</Text>

        {/* TODO: Implement ratings and views in future */}
        {/* <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color={COLORS.accent.gold} />
          <Text style={styles.ratingText}>{content.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.durationText}>{content.duration}</Text>
        </View> */}

        <View style={styles.ratingRow}>
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
    backgroundColor: COLORS.bg.nearBlack,
  },
  thumb: {
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    backgroundColor: COLORS.bg.elevated,
  },
  thumbCircle: {
    position: 'absolute',
    width: '80%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: COLORS.overlay.surfaceXFaint,
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
    backgroundColor: COLORS.accent.amber700,
  },
  badgePurple: {
    backgroundColor: COLORS.brand.primaryDark,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: COLORS.overlay.heavy,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: 11,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  info: {
    padding: 8,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  dot: {
    fontSize: 11,
    color: COLORS.border.medium,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  language: {
    fontSize: 11,
    color: COLORS.text.dimmed,
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.overlay.rippleMed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
