import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  Share,
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
import { getContentDetail, listContent } from '../services/contentService';
import { ContentCard } from '../components/ContentCard';
import { ENV } from '../constants/env';
import { COLORS } from '../constants/colors';

const SCREEN_H = Dimensions.get('window').height;

// ─── Genre colours (mirrors ContentCard) ─────────────────────────────────────
const GENRE_BG: Record<string, [string, string, string]> = {
  Drama:          [COLORS.accent.violet950, COLORS.accent.violet900, COLORS.brand.primaryDark],
  Thriller:       [COLORS.bg.stoneBlack, COLORS.bg.stone900, COLORS.accent.amber900],
  'Musical Drama':[COLORS.accent.pinkDark, COLORS.accent.pink900, COLORS.accent.rose700],
  Comedy:         [COLORS.accent.greenDark, COLORS.accent.green900, COLORS.accent.green700],
  Romance:        [COLORS.accent.rose950, COLORS.accent.rose900, COLORS.accent.rose600],
  'Sci-Fi':       [COLORS.accent.sky950, COLORS.accent.sky900, COLORS.accent.sky600],
  Family:         [COLORS.bg.stone900, COLORS.bg.stone800, COLORS.accent.orange],
  Documentary:    [COLORS.accent.teal950, COLORS.accent.teal900, COLORS.accent.teal],
  Experimental:   [COLORS.accent.indigoDark, COLORS.accent.indigo900, COLORS.accent.indigo],
  default:        [COLORS.bg.splash, COLORS.accent.indigoDark, COLORS.accent.indigo700],
};


// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentDetailScreenProps {
  content: Content;
  onBack: () => void;
  onRent: (content: Content) => void;
  onWatchNow: () => void;
  isRented: boolean;
  isPremium: boolean;
  isFavorited: boolean;
  onToggleFavorite: (contentId: string, currentlyFavorited: boolean) => Promise<void>;
  onEpisodePlay: (ep: Episode, episodeNumber: number) => void;
  onContentClick: (content: Content) => void;
}

// ─── TrailerPlayer ───────────────────────────────────────────────────────────
// Self-contained: useVideoPlayer is called only when this component mounts,
// which is deferred until after the navigation transition via InteractionManager.
function TrailerPlayer({ uri }: { uri: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer({ uri }, p => {
    p.muted = false;
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
  isFavorited,
  onToggleFavorite,
  onEpisodePlay,
  onContentClick,
}: ContentDetailScreenProps) {
  const liked = isFavorited;
  const handleToggleFavorite = () => onToggleFavorite(content.id, liked);
  const scrollRef = useRef<ScrollView>(null);
  // Deferred: mount TrailerPlayer only after navigation transition completes
  const [videoMounted, setVideoMounted] = useState(false);

  // Self-fetch episodeList if the prop came from a list endpoint (episodeList is null there).
  const [episodeList, setEpisodeList] = useState<Episode[] | null | undefined>(
    content.episodeList,
  );

  useEffect(() => {
    setEpisodeList(content.episodeList);
    if (content.type === 'vertical-series' && (!content.episodeList || content.episodeList.length === 0)) {
      getContentDetail(content.id)
        .then(full => setEpisodeList(full.episodeList ?? null))
        .catch(() => { /* silently keep null */ });
    }
  }, [content.id, content.type, content.episodeList]);

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

  // ── More Like This ───────────────────────────────────────────────────────
  const [moreLikeThis, setMoreLikeThis] = useState<Content[]>([]);

  const fetchMoreLikeThis = useCallback(async (c: Content) => {
    try {
      // Primary filter: same type via API — verticals stay with verticals, short films with short films
      const res = await listContent({ type: c.type, genre: c.genre, limit: 12 });
      const filtered = res.data
        // Safety net: enforce same type on client in case API ignores the param
        .filter(item => item.id !== c.id && item.type === c.type)
        // Rank by similarity: same language → festival winner → rest
        .sort((a, b) => {
          const langA = a.language === c.language ? -2 : 0;
          const langB = b.language === c.language ? -2 : 0;
          const fwA   = a.festivalWinner ? -1 : 0;
          const fwB   = b.festivalWinner ? -1 : 0;
          return (langA + fwA) - (langB + fwB);
        })
        .slice(0, 6);
      setMoreLikeThis(filtered);
    } catch {
      setMoreLikeThis([]);
    }
  }, []);

  useEffect(() => {
    fetchMoreLikeThis(content);
  }, [content.id, fetchMoreLikeThis]);

  // Scroll to top whenever the displayed content changes (e.g. More Like This tap)
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [content.id]);

  // Gate: mount TrailerPlayer only after the navigation push animation finishes
  useEffect(() => {
    if (!content.trailer) { return; }
    setVideoMounted(false);
    const task = InteractionManager.runAfterInteractions(() => setVideoMounted(true));
    return () => task.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.id]);

  // TODO: Implement ratings and views in future
  // const formatViews = (v: number) =>
  //   v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  const handleShare = async () => {
    const webLink = `${ENV.APP_WEB_URL}/open.html?id=${content.id}&title=${encodeURIComponent(content.title)}`;
    const message = `🎬 Watch "${content.title}" on Shortsy!\n\n${content.description?.slice(0, 120)}...\n\n${webLink}`;
    try {
      await Share.share({ message, title: content.title, url: webLink });
    } catch (_) { /* user cancelled or share unavailable */ }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
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
            colors={['transparent', COLORS.overlay.playBtn, COLORS.bg.black]}
            style={styles.heroFade}
            pointerEvents="none"
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>

          {/* Top-right actions */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? COLORS.accent.red : COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Info ── */}
        <View style={styles.info}>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {content.festivalWinner && (
              <View style={[styles.badge, styles.badgeAmber]}>
                <Ionicons name="trophy" size={12} color={COLORS.text.primary} />
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
            {/* TODO: Implement ratings and views in future */}
            {/* <View style={styles.statItem}>
              <Ionicons name="star" size={14} color={COLORS.accent.gold} />
              <Text style={styles.statHighlight}>{content.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={14} color={COLORS.text.muted} />
              <Text style={styles.statDim}>{formatViews(content.views)} views</Text>
            </View> */}
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.text.muted} />
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
          {content.type === 'vertical-series' && episodeList && episodeList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{episodeList.length} Episodes · {content.duration} each</Text>
              {episodeList.map((ep: Episode, index: number) => (
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
                      <Ionicons name="time-outline" size={12} color={COLORS.text.muted} />
                      <Text style={epStyles.duration}>{ep.duration}</Text>
                    </View>
                  </View>
                  <View style={[epStyles.playBtn, !rentalActive && epStyles.lockBtn]}>
                    {rentalActive
                      ? <Ionicons name="play" size={16} color={COLORS.brand.primaryDark} />
                      : <Ionicons name="lock-closed" size={14} color={COLORS.text.tertiary} />}
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

          {/* More Like This */}
          {moreLikeThis.length > 0 && (
            <View style={styles.moreLikeThisSection}>
              <View style={styles.moreLikeThisHeader}>
                <Ionicons name="sparkles" size={16} color={COLORS.brand.violet} />
                <Text style={styles.moreLikeThisTitle}>More Like This</Text>
              </View>
              <Text style={styles.moreLikeThisSubtitle}>{content.genre} · {content.language}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moreLikeThisRow}>
                {moreLikeThis.map(item => (
                  <View key={item.id} style={styles.moreLikeThisItem}>
                    <ContentCard content={item} onClick={() => onContentClick(item)} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom spacer so CTA doesn't cover content */}
          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* ── Fixed CTA ── */}
      <View style={styles.cta}>
        <LinearGradient
          colors={['transparent', COLORS.overlay.ctaFadeEnd, COLORS.bg.black]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {rentalActive ? (
          <TouchableOpacity style={styles.watchBtn} activeOpacity={0.85} onPress={onWatchNow}>
            <Ionicons name="play" size={18} color={COLORS.text.primary} />
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
  container: { flex: 1, backgroundColor: COLORS.bg.black },
  scroll:    { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  hero: {
    height: 340,
    overflow: 'hidden',
    backgroundColor: COLORS.bg.elevated,
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
    backgroundColor: COLORS.overlay.controlBg,
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
    backgroundColor: COLORS.overlay.controlBg,
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
  badgeAmber:       { backgroundColor: COLORS.accent.amber600 },
  badgePurple:      { backgroundColor: COLORS.brand.primaryDark },
  badgeOutline:     { borderWidth: 1, borderColor: COLORS.border.medium },
  badgeText:        { fontSize: 12, fontWeight: '600', color: COLORS.text.primary },
  badgeOutlineText: { color: COLORS.text.secondary },

  title: { fontSize: 28, fontWeight: '800', color: COLORS.text.primary, marginBottom: 14, lineHeight: 34 },

  statsRow:     { flexDirection: 'row', gap: 20, marginBottom: 12 },
  statItem:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statHighlight:{ fontSize: 14, color: COLORS.text.primary, fontWeight: '600' },
  statDim:      { fontSize: 13, color: COLORS.text.muted },

  dirRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  dirLabel:{ fontSize: 13, color: COLORS.text.muted },
  dirValue:{ fontSize: 13, color: COLORS.text.primary },
  bullet:  { fontSize: 13, color: COLORS.border.medium },

  section:     { marginBottom: 20 },
  sectionLabel:{ fontSize: 12, fontWeight: '600', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  synopsis:    { fontSize: 15, color: COLORS.text.primary, lineHeight: 24 },
  synopsisDim: { fontSize: 13, color: COLORS.text.muted, lineHeight: 20 },

  moodBadge:    { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.brand.primaryDark },
  moodBadgeText:{ fontSize: 13, color: COLORS.brand.violet, fontWeight: '500' },

  // More Like This
  moreLikeThisSection: {
    marginBottom: 20,
    marginTop: 4,
  },
  moreLikeThisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  moreLikeThisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  moreLikeThisSubtitle: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 14,
  },
  moreLikeThisRow: {
    gap: 12,
    paddingRight: 4,
  },
  moreLikeThisItem: {
    width: 140,
  },

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
    backgroundColor: COLORS.brand.primaryDark,
  },
  watchBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },

  rentWrap: { gap: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  priceLabel:{ fontSize: 13, color: COLORS.text.muted },
  priceValue:{ fontSize: 26, fontWeight: '800', color: COLORS.text.primary },
  rentBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rentBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.bg.black },
  rentNote:    { fontSize: 12, color: COLORS.text.dimmed, textAlign: 'center' },
});



// ─── Episode tile styles ──────────────────────────────────────────────────────
const epStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.modal,
    gap: 12,
  },
  numWrap: {
    width: 22,
    alignItems: 'center',
  },
  num: {
    fontSize: 13,
    color: COLORS.text.dimmed,
    fontWeight: '600',
  },
  thumb: {
    width: 100,
    height: 62,
    borderRadius: 8,
    backgroundColor: COLORS.bg.elevated,
  },
  meta: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.overlay.brandTint25,
    borderWidth: 1,
    borderColor: COLORS.brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtn: {
    backgroundColor: COLORS.overlay.neutral20,
    borderColor: COLORS.border.medium,
  },
});
