import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Content } from '../data/mockData';
import { ContentCard } from '../components/ContentCard';
import { MoodCard } from '../components/MoodCard';
import { VideoView, useVideoPlayer } from 'react-native-video';
import {
  clearContentCache,
  getFeaturedContent,
  getContentMetadata,
  listContent,
} from '../services/contentService';
import type { WatchProgress, FeaturedHero } from '../types/api';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.68;

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  Icon,
  title,
  subtitle,
}: {
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {Icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Shimmer effect ───────────────────────────────────────────────────────────
function ShimmerPlaceholder({ width, height, borderRadius = 0 }: { width: number | '100%'; height: number; borderRadius?: number }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width === '100%' ? '100%' : width,
          height,
          borderRadius,
          backgroundColor: COLORS.bg.shimmer,
        },
        { opacity },
      ]}
    />
  );
}

// ─── Continue Watching Card ──────────────────────────────────────────────────
const CW_WIDTH = width * 0.52;

function ContinueWatchingCard({
  content,
  prog,
  pct,
  subtitle,
  onPress,
}: {
  content: Content;
  prog: WatchProgress | undefined;
  pct: number;
  subtitle: string;
  onPress: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchableOpacity
      style={cwStyles.card}
      activeOpacity={0.8}
      onPress={onPress}>
      {/* Shimmer placeholder */}
      {!imageLoaded && (
        <View style={[cwStyles.thumb, { position: 'absolute' }]}>
          <ShimmerPlaceholder width="100%" height={CW_WIDTH * 0.62} borderRadius={0} />
        </View>
      )}
      
      {/* Thumbnail image */}
      <Image
        source={{ 
          uri: content.thumbnail,
          cache: 'force-cache',
        }}
        style={cwStyles.thumb}
        resizeMode="cover"
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* dark overlay */}
      <View style={cwStyles.overlay} />
      
      {/* Progress bar — shown whenever we have progress data */}
      {prog && pct > 0 && (
        <View style={cwStyles.progressTrack}>
          <LinearGradient
            colors={COLORS.gradient.progress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[cwStyles.progressFill, { width: `${pct}%` as any }]}
          />
        </View>
      )}
      
      {/* series badge */}
      {content.type === 'vertical-series' && (
        <View style={cwStyles.badge}>
          <Text style={cwStyles.badgeText}>Series</Text>
        </View>
      )}
      
      {/* play button */}
      <View style={cwStyles.playCircle}>
        <Ionicons name="play" size={12} color={COLORS.icon.white} style={{ marginLeft: 2 }} />
      </View>
      
      <View style={cwStyles.info}>
        <Text style={cwStyles.title} numberOfLines={1}>{content.title}</Text>
        <Text style={cwStyles.sub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Hero card ────────────────────────────────────────────────────────────────
function HeroCard({
  hero,
  onPress,
  player,
  rentedContent,
  progressRecord,
  onWatchNow,
}: {
  hero: FeaturedHero;
  onPress: () => void;
  player: ReturnType<typeof useVideoPlayer>;
  rentedContent: Content[];
  progressRecord: Record<string, WatchProgress>;
  onWatchNow: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageOpacity] = useState(new Animated.Value(1));
  const [imageLoaded, setImageLoaded] = useState(false);

  // Find matching rented content to get complete content object with progress
  const rentedHeroContent = rentedContent.find(c => c.id === hero.id);
  const isRented = !!rentedHeroContent;

  // Preload image on mount
  useEffect(() => {
    if (hero.thumbnail) {
      Image.prefetch(hero.thumbnail)
        .then(() => setImageLoaded(true))
        .catch(() => setImageLoaded(true)); // Still set to true to avoid blocking
    }
  }, [hero.thumbnail]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Wait 2 seconds after mount to transition from thumbnail to video
    timeoutId = setTimeout(() => {
      // Fade out thumbnail image
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowVideo(true);
      });
    }, 2000);

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [imageOpacity]);

  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      {/* Video background */}
      <VideoView
        resizeMode='cover'
        player={player}
        style={StyleSheet.absoluteFill}
      />

      {/* Thumbnail image overlay - visible until video is ready */}
      {!showVideo && (
        <Animated.Image
          source={{ 
            uri: hero.thumbnail,
            cache: 'force-cache',
          }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: imageLoaded ? imageOpacity : 0 },
          ]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {/* Fade-to-black overlay at bottom */}
      <LinearGradient
        colors={COLORS.gradient.heroBg}
        style={heroStyles.overlay}
      />

      {/* App bar */}
      <View style={heroStyles.appBar}>
        <View style={heroStyles.appBarBrand}>
          <Image
            source={require('../assets/logo.png')}
            style={heroStyles.appBarLogo}
            resizeMode="contain"
          />
          <Text style={heroStyles.appBarTitle}>SHORTSY</Text>
        </View>
      </View>

      {/* Hero info */}
      <View style={heroStyles.infoBlock}>
        {hero.festivalWinner && (
          <View style={heroStyles.winnerRow}>
            <Ionicons name="trophy" size={20} color={COLORS.icon.gold} style={{ marginRight: 4 }} />
            <Text style={heroStyles.winnerText}>Festival Winner</Text>
          </View>
        )}
        <Text style={heroStyles.heroTitle}>{hero.title}</Text>
        <Text style={heroStyles.heroDesc} numberOfLines={2}>
          {hero.description}
        </Text>
        <View style={heroStyles.metaRow}>
          <Text style={heroStyles.metaText}>{hero.duration}</Text>
          <Text style={heroStyles.metaDot}>•</Text>
          <Text style={heroStyles.metaText}>{hero.genre}</Text>
          <Text style={heroStyles.metaDot}>•</Text>
          <Text style={heroStyles.metaText}>{hero.language}</Text>
        </View>
        {isRented ? (
          <TouchableOpacity onPress={onWatchNow} style={heroStyles.watchBtn} activeOpacity={0.85}>
            <Text style={heroStyles.watchBtnText}>▶ Watch Now</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onPress} style={heroStyles.rentBtn} activeOpacity={0.85}>
            <Text style={heroStyles.rentBtnText}>Rent for ₹{hero.price}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
interface HomePageProps {
  onContentClick: (content: Content) => void;
  onSearchClick: () => void;
  rentedContent?: Content[];
  progressMap?: Map<string, WatchProgress>;
  onRentedClick: (content: Content) => void;
  onRefreshRentals?: () => Promise<void>;
  onGenreClick: (genre: { id: string; name: string; emoji: string }) => void;
}

export function HomePage({ onContentClick, onSearchClick, rentedContent = [], progressMap = new Map(), onRentedClick, onRefreshRentals, onGenreClick }: HomePageProps) {
  // ── Service-fetched state ─────────────────────────────────────────────────
  const [allContent,       setAllContent]       = useState<Content[]>([]);
  const [featuredContent,  setFeaturedContent]  = useState<Content[]>([]);
  const [festivalWinners,  setFestivalWinners]  = useState<Content[]>([]);
  const [verticalSeries,   setVerticalSeries]   = useState<Content[]>([]);
  const [genreList,        setGenreList]        = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [hero,             setHero]             = useState<FeaturedHero | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  
  // Convert Map to Record for ContentCard compatibility
  const progressRecord = React.useMemo(() => {
    const record: Record<string, WatchProgress> = {};
    progressMap.forEach((progress, id) => {
      record[id] = progress;
    });
    return record;
  }, [progressMap]);

  const handleRefresh = useCallback(async () => {
    clearContentCache();
    setRefreshing(true);
    try {
      // Also fetch user rentals if callback is provided
      if (onRefreshRentals) {
        await onRefreshRentals();
      }
      
      const [featuredRes, metaRes, allRes] = await Promise.all([
        getFeaturedContent(),
        getContentMetadata(),
        listContent(),
      ]);
      setHero(featuredRes.hero);
      setFeaturedContent(featuredRes.featured);
      // Transform genres array to objects with emoji (excluding 'All')
      const genreIcons: Record<string, string> = {
        'Drama': '🎭',
        'Thriller': '🔪',
        'Romance': '❤️',
        'Comedy': '😂',
        'Documentary': '🎥',
        'Experimental': '🧪',
        'Family': '👨‍👩‍👧‍👦',
      };
      setGenreList(
        metaRes.genres
          .filter((g: string) => g !== 'All')
          .map((g: string) => ({
            id: g.toLowerCase().replace(/\s+/g, '-'),
            name: g,
            emoji: genreIcons[g] || '🎬',
          }))
      );
      const all = allRes.data;
      setAllContent(all);
      setFestivalWinners(all.filter((c: Content) => c.festivalWinner));
      setVerticalSeries(all.filter((c: Content) => c.type === 'vertical-series'));
    } catch (err) {
      console.error('[HomePage] Pull-to-refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshRentals]);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        // All three calls fire in parallel
        const [featuredRes, metaRes, allRes] = await Promise.all([
          getFeaturedContent(),
          getContentMetadata(),
          listContent(),
        ]);

        setHero(featuredRes.hero);
        setFeaturedContent(featuredRes.featured);
        // Transform genres array to objects with emoji (excluding 'All')
        const genreIcons: Record<string, string> = {
          'Drama': '🎭',
          'Thriller': '🔪',
          'Romance': '❤️',
          'Comedy': '😂',
          'Documentary': '🎥',
          'Experimental': '🧪',
          'Family': '👨‍👩‍👧‍👦',
        };
        setGenreList(
          metaRes.genres
            .filter((g: string) => g !== 'All')
            .map((g: string) => ({
              id: g.toLowerCase().replace(/\s+/g, '-'),
              name: g,
              emoji: genreIcons[g] || '🎬',
            }))
        );

        const all = allRes.data;
        setAllContent(all);
        setFestivalWinners(all.filter(c => c.festivalWinner));
        setVerticalSeries(all.filter(c => c.type === 'vertical-series'));
      } catch (err) {
        console.error('[HomePage] Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  // Use a placeholder video initially, will be replaced when hero loads
  const placeholderVideo = 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3';
  const videoSource = hero?.videoUrl || placeholderVideo;
  
  const player = useVideoPlayer(videoSource, p => {
    p.loop = false;
    p.muted = true;
    p.play();
  });
  
  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    // Hero is visible when scrollY is less than its height
    if (scrollY >= HERO_HEIGHT) {
      if (player.isPlaying) player.pause();
    } else {
      if (!player.isPlaying) player.play();
    }
  };

  return (
    <View style={styles.root}>
      {/* Fixed search button floating top-right over hero */}
      <TouchableOpacity
        onPress={onSearchClick}
        style={styles.searchFab}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="search" size={20} color={COLORS.icon.white} />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.violet} />
        </View>
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.brand.violet}
            colors={[COLORS.brand.violet]}
          />
        }>

        {/* ── Hero ── */}
        {hero && (
          <HeroCard 
            key={hero.id}
            hero={hero} 
            onPress={() => onContentClick({ 
              ...hero, 
              director: '', 
              mood: '', 
              views: 0,
              episodes: undefined,
              episodeList: undefined,
              trailer: hero.videoUrl,
            })} 
            player={player}
            rentedContent={rentedContent}
            progressRecord={progressRecord}
            onWatchNow={() => {
              // Find the actual rented content to preserve all properties and progress
              const rentedHeroContent = rentedContent.find(c => c.id === hero.id);
              if (rentedHeroContent) {
                onRentedClick(rentedHeroContent);
              }
            }}
          />
        )}

        {/* ── Continue Watching ── */}
        {rentedContent.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              Icon={<Ionicons name="play-circle" size={18} color={COLORS.icon.brand} />}
              title="Continue Watching"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueRow}>
              {rentedContent.map(content => {
                const prog = progressRecord[content.id];
                const pct  = prog ? Math.min(Math.max(prog.progressPercent, 0), 100) : 0;
                let subtitle: string;
                if (!prog) {
                  subtitle = content.type === 'vertical-series'
                    ? `${content.episodes} eps`
                    : content.duration;
                } else if (content.type === 'vertical-series') {
                  const ep = prog.lastEpisodeNumber ?? 1;
                  subtitle = `Ep ${ep} · ${Math.round(pct)}% watched`;
                } else {
                  subtitle = `${Math.round(pct)}% watched`;
                }
                return (
                  <ContinueWatchingCard
                    key={content.id}
                    content={content}
                    prog={prog}
                    pct={pct}
                    subtitle={subtitle}
                    onPress={() => onRentedClick(content)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Genre Discovery ── */}
        <View style={styles.section}>
          <SectionHeader
            Icon={<Ionicons name="sparkles" size={18} color={COLORS.icon.brand} />}
            title="Discover by Genre"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodRow}>
            {genreList.map(genre => (
              <MoodCard
                key={genre.id}
                name={genre.name}
                emoji={genre.emoji}
                onClick={() => onGenreClick(genre)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Vertical Series ── */}
        <View style={styles.section}>
          <SectionHeader
            Icon={<Ionicons name="trending-up" size={18} color={COLORS.icon.brand} />}
            title="Vertical Series"
            subtitle="Premium storytelling in 9:16"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hRow}>
            {verticalSeries.map(content => (
              <View key={content.id} style={styles.hItem}>
                <ContentCard
                  content={content}
                  onClick={() => onContentClick(content)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Festival Winners ── */}
        <View style={styles.section}>
          <SectionHeader
            Icon={<Ionicons name="trophy" size={18} color={COLORS.icon.gold} />}
            title="Festival Winners"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hRow}>
            {festivalWinners.map(content => (
              <View key={content.id} style={styles.hItem}>
                <ContentCard
                  content={content}
                  onClick={() => onContentClick(content)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── All Content ── */}
        <View style={styles.section}>
          <SectionHeader
            Icon={<Ionicons name="film" size={18} color={COLORS.icon.brand} />}
            title="All Content"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hRow}>
            {allContent.map(content => (
              <View key={content.id} style={styles.hItem}>
                <ContentCard
                  content={content}
                  onClick={() => onContentClick(content)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* bottom padding for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg.black,
  },
  searchFab: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 18,
    right: 16,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.overlay.fab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.text.dimmed,
  },
  moodRow: {
    gap: 13,
    paddingRight: 16,
    paddingVertical: 4,
  },
  continueRow: {
    gap: 12,
    paddingRight: 16,
  },
  hRow: {
    gap: 12,
    paddingRight: 16,
  },
  hItem: {
    width: (width - 16 * 2 - 12) / 2,
  },
});

const heroStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.65,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: COLORS.overlay.circle1,
    top: -width * 0.15,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: COLORS.overlay.circle2,
    bottom: width * 0.2,
    left: -width * 0.1,
  },
  appBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 16,
    left: 16,
    right: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBarLogo: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  infoBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 8,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerText: {
    fontSize: 12,
    color: COLORS.text.gold,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  metaDot: {
    fontSize: 12,
    color: COLORS.text.dimmed,
  },
  rentBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  rentBtnText: {
    color: COLORS.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  watchBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  watchBtnText: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

// ─── (icon styles removed — now using Ionicons) ─────────────────────────────

// ─── Continue Watching card styles ────────────────────────────────────────────
const cwStyles = StyleSheet.create({
  card: {
    width: CW_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bg.elevated,
  },
  thumb: {
    width: '100%',
    height: CW_WIDTH * 0.62,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.card,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.brand.primaryDark,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.4,
  },
  playCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.overlay.playBtn,
    borderWidth: 1.5,
    borderColor: COLORS.overlay.playBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 10,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sub: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.overlay.progress,
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
});
