import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { VideoView, useVideoPlayer } from 'react-native-video';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Content, Episode } from '../data/mockData';
import { checkRentalStatus } from '../services/rentalService';

const SCREEN_H = Dimensions.get('window').height;

// ─── Genre colours (mirrors ContentCard) ─────────────────────────────────────
const GENRE_BG: Record<string, [string, string, string]> = {
  Drama:          ['#2e1065', '#4c1d95', '#7c3aed'],
  Thriller:       ['#0c0a09', '#1c1917', '#78350f'],
  'Musical Drama':['#4a0d2e', '#831843', '#be185d'],
  Comedy:         ['#052e16', '#14532d', '#16a34a'],
  Romance:        ['#4c0519', '#881337', '#e11d48'],
  'Sci-Fi':       ['#082f49', '#0c4a6e', '#0284c7'],
  Family:         ['#1c1917', '#292524', '#f97316'],
  Documentary:    ['#042f2e', '#134e4a', '#0d9488'],
  Experimental:   ['#1e1b4b', '#312e81', '#6366f1'],
  default:        ['#0f0e30', '#1e1b4b', '#4338ca'],
};


// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentDetailScreenProps {
  content: Content;
  onBack: () => void;
  onRent: (content: Content) => void;
  onWatchNow: () => void;
  isRented: boolean;
  isPremium: boolean;
  onEpisodePlay: (ep: Episode, episodeNumber: number) => void;
}

// ─── TrailerPlayer ───────────────────────────────────────────────────────────
// Self-contained: useVideoPlayer is called only when this component mounts,
// which is deferred until after the navigation transition via InteractionManager.
function TrailerPlayer({ uri }: { uri: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer({ uri }, p => {
    p.muted = true;
    p.loop = false;
  });

  useEffect(() => {
    const loadSub = player.addEventListener('onLoad', () => {
      player.play();
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
    const endSub = player.addEventListener('onEnd', () => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    });
    return () => {
      loadSub.remove();
      endSub.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity }]}
      pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        controls={false}
      />
    </Animated.View>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────────
export function ContentDetailScreen({
  content,
  onBack,
  onRent,
  onWatchNow,
  isRented,
  isPremium,
  onEpisodePlay,
}: ContentDetailScreenProps) {
  const [liked, setLiked] = useState(false);
  // Deferred: mount TrailerPlayer only after navigation transition completes
  const [videoMounted, setVideoMounted] = useState(false);

  // Start from the prop value (instant, no flicker), then verify against the
  // service layer so ground truth is always from the backend (real or mock).
  // Premium users have access to all content regardless of rental status
  const [rentalActive, setRentalActive] = useState(isRented || isPremium);

  useEffect(() => {
    // If user has premium, they always have access
    if (isPremium) {
      setRentalActive(true);
      return;
    }
    checkRentalStatus(content.id)
      .then(({ isRented: active }) => setRentalActive(active))
      .catch(() => { /* silently fallback to prop value */ });
  }, [content.id, isPremium]);
  const [bg1, bg2, bg3] = GENRE_BG[content.genre] ?? GENRE_BG.default;

  // Gate: mount TrailerPlayer only after the navigation push animation finishes
  useEffect(() => {
    if (!content.trailer) { return; }
    setVideoMounted(false);
    const task = InteractionManager.runAfterInteractions(() => setVideoMounted(true));
    return () => task.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.id]);

  const formatViews = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={[
          styles.hero,
          content.type === 'vertical-series' && { height: Math.round(SCREEN_H * 0.65) },
        ]}>
          {/* Gradient fallback */}
          <LinearGradient
            colors={[bg1, bg2, bg3]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Thumbnail — always visible as base layer */}
          {content.thumbnail ? (
            <Image
              source={{ uri: content.thumbnail }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : null}
          {/* TrailerPlayer mounts only after nav transition; self-manages crossfade */}
          {videoMounted && content.trailer ? (
            <TrailerPlayer uri={content.trailer} />
          ) : null}
          {/* Bottom fade */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
            style={styles.heroFade}
            pointerEvents="none"
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </TouchableOpacity>

          {/* Top-right actions */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setLiked(v => !v)}
              activeOpacity={0.8}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#ef4444' : '#ffffff'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons name="share-social" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Info ── */}
        <View style={styles.info}>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {content.festivalWinner && (
              <View style={[styles.badge, styles.badgeAmber]}>
                <Ionicons name="trophy" size={12} color="#ffffff" />
                <Text style={[styles.badgeText, { marginLeft: 4 }]}>Festival Winner</Text>
              </View>
            )}
            {content.type === 'vertical-series' && (
              <View style={[styles.badge, styles.badgePurple]}>
                <Text style={styles.badgeText}>Vertical Series</Text>
              </View>
            )}
            <View style={[styles.badge, styles.badgeOutline]}>
              <Text style={[styles.badgeText, styles.badgeOutlineText]}>{content.genre}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.statHighlight}>{content.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={14} color="#737373" />
              <Text style={styles.statDim}>{formatViews(content.views)} views</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color="#737373" />
              <Text style={styles.statDim}>{content.duration}</Text>
            </View>
          </View>

          {/* Director + Language */}
          <View style={styles.dirRow}>
            <Text style={styles.dirLabel}>Dir:</Text>
            <Text style={styles.dirValue}>{content.director}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.dirLabel}>{content.language}</Text>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Synopsis</Text>
            <Text style={styles.synopsis}>{content.description}</Text>
          </View>

          {/* Episodes (series only) */}
          {content.type === 'vertical-series' && content.episodeList && content.episodeList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{content.episodeList.length} Episodes · {content.duration} each</Text>
              {content.episodeList.map((ep: Episode, index: number) => (
                <TouchableOpacity
                  key={ep.id}
                  style={epStyles.row}
                  activeOpacity={0.75}
                  onPress={() => rentalActive && onEpisodePlay(ep, index + 1)}>
                  <View style={epStyles.numWrap}>
                    <Text style={epStyles.num}>{index + 1}</Text>
                  </View>
                  <Image
                    source={{ uri: ep.thumbnail }}
                    style={epStyles.thumb}
                    resizeMode="cover"
                  />
                  <View style={epStyles.meta}>
                    <Text style={epStyles.title} numberOfLines={1}>{ep.title}</Text>
                    <View style={epStyles.durationRow}>
                      <Ionicons name="time-outline" size={12} color="#737373" />
                      <Text style={epStyles.duration}>{ep.duration}</Text>
                    </View>
                  </View>
                  <View style={[epStyles.playBtn, !rentalActive && epStyles.lockBtn]}>
                    {rentalActive
                      ? <Ionicons name="play" size={16} color="#7c3aed" />
                      : <Ionicons name="lock-closed" size={14} color="#a3a3a3" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mood */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mood</Text>
            <View style={styles.moodBadge}>
              <Text style={styles.moodBadgeText}>{content.mood}</Text>
            </View>
          </View>

          {/* Bottom spacer so CTA doesn't cover content */}
          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* ── Fixed CTA ── */}
      <View style={styles.cta}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)', '#000000']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {rentalActive ? (
          <TouchableOpacity style={styles.watchBtn} activeOpacity={0.85} onPress={onWatchNow}>
            <Ionicons name="play" size={18} color="#ffffff" />
            <Text style={styles.watchBtnText}>Watch Now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rentWrap}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Rental Price</Text>
              <Text style={styles.priceValue}>₹{content.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.rentBtn}
              onPress={() => onRent(content)}
              activeOpacity={0.85}>
              <Text style={styles.rentBtnText}>Rent &amp; Watch</Text>
            </TouchableOpacity>
            <Text style={styles.rentNote}>
              {content.type === 'vertical-series'
                ? 'Full season access'
                : '48-hour viewing window'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll:    { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  hero: {
    height: 340,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroFade: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 160,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: {
    position: 'absolute',
    top: 52,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  info: { paddingHorizontal: 20, paddingTop: 20 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeAmber:       { backgroundColor: '#d97706' },
  badgePurple:      { backgroundColor: '#7c3aed' },
  badgeOutline:     { borderWidth: 1, borderColor: '#404040' },
  badgeText:        { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  badgeOutlineText: { color: '#d4d4d4' },

  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 14, lineHeight: 34 },

  statsRow:     { flexDirection: 'row', gap: 20, marginBottom: 12 },
  statItem:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statHighlight:{ fontSize: 14, color: '#ffffff', fontWeight: '600' },
  statDim:      { fontSize: 13, color: '#737373' },

  dirRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  dirLabel:{ fontSize: 13, color: '#737373' },
  dirValue:{ fontSize: 13, color: '#ffffff' },
  bullet:  { fontSize: 13, color: '#404040' },

  section:     { marginBottom: 20 },
  sectionLabel:{ fontSize: 12, fontWeight: '600', color: '#737373', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  synopsis:    { fontSize: 15, color: '#ffffff', lineHeight: 24 },
  synopsisDim: { fontSize: 13, color: '#737373', lineHeight: 20 },

  moodBadge:    { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#7c3aed' },
  moodBadgeText:{ fontSize: 13, color: '#a855f7', fontWeight: '500' },

  // CTA
  cta: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
  },
  watchBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },

  rentWrap: { gap: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  priceLabel:{ fontSize: 13, color: '#737373' },
  priceValue:{ fontSize: 26, fontWeight: '800', color: '#ffffff' },
  rentBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rentBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  rentNote:    { fontSize: 12, color: '#525252', textAlign: 'center' },
});



// ─── Episode tile styles ──────────────────────────────────────────────────────
const epStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    gap: 12,
  },
  numWrap: {
    width: 22,
    alignItems: 'center',
  },
  num: {
    fontSize: 13,
    color: '#525252',
    fontWeight: '600',
  },
  thumb: {
    width: 100,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  meta: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 18,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: '#737373',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 1,
    borderColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtn: {
    backgroundColor: 'rgba(82,82,82,0.2)',
    borderColor: '#404040',
  },
});
