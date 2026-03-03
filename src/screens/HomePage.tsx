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

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.68;

// ─── Pure-View icons ──────────────────────────────────────────────────────────
function FilmIcon({ color = '#a855f7' }: { color?: string }) {
  return (
    <View style={[iconStyles.filmOuter, { borderColor: color }]}>
      <View style={[iconStyles.filmStrip, { borderRightColor: color }]}>
        {[0, 1, 2].map(i => <View key={i} style={[iconStyles.filmHole, { backgroundColor: color }]} />)}
      </View>
      <View style={{ flex: 1 }} />
      <View style={[iconStyles.filmStrip, iconStyles.filmStripRight, { borderLeftColor: color }]}>
        {[0, 1, 2].map(i => <View key={i} style={[iconStyles.filmHole, { backgroundColor: color }]} />)}
      </View>
    </View>
  );
}

function SearchIcon() {
  return (
    <View style={iconStyles.searchWrap}>
      <View style={iconStyles.searchCircle} />
      <View style={iconStyles.searchHandle} />
    </View>
  );
}

function SparklesIcon() {
  return (
    <View style={iconStyles.sparkWrap}>
      <View style={[iconStyles.sparkBar, iconStyles.sparkV]} />
      <View style={[iconStyles.sparkBar, iconStyles.sparkH]} />
      <View style={[iconStyles.sparkBar, iconStyles.sparkD1]} />
      <View style={[iconStyles.sparkBar, iconStyles.sparkD2]} />
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

function AwardIcon({ color = '#f59e0b' }: { color?: string }) {
  return (
    <View style={iconStyles.awardWrap}>
      <View style={[iconStyles.awardCircle, { borderColor: color }]} />
      <View style={[iconStyles.awardRibLeft, { backgroundColor: color }]} />
      <View style={[iconStyles.awardRibRight, { backgroundColor: color }]} />
    </View>
  );
}

function PlayResumeIcon() {
  return (
    <View style={iconStyles.resumeWrap}>
      <View style={iconStyles.resumeBar} />
      <View style={iconStyles.resumeTriangle} />
    </View>
  );
}

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
          backgroundColor: '#262626',
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
            colors={['#7c3aed', '#db2777']}
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
        <View style={cwStyles.playTriangle} />
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
        colors={['transparent', '#000000dd', '#000000']}
        style={heroStyles.overlay}
      />

      {/* App bar */}
      <View style={heroStyles.appBar}>
        <View style={heroStyles.appBarBrand}>
          <FilmIcon color="#a855f7" />
          <Text style={heroStyles.appBarTitle}>SHORTSY</Text>
        </View>
      </View>

      {/* Hero info */}
      <View style={heroStyles.infoBlock}>
        {hero.festivalWinner && (
          <View style={heroStyles.winnerRow}>
            <AwardIcon color="#f59e0b" />
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
        <SearchIcon />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
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
            tintColor="#a855f7"
            colors={['#a855f7']}
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
              Icon={<PlayResumeIcon />}
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
            Icon={<SparklesIcon />}
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
            Icon={<TrendingUpIcon />}
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
            Icon={<AwardIcon />}
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
            Icon={<FilmIcon />}
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
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  searchFab: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 18,
    right: 16,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00000088',
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
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#525252',
  },
  moodRow: {
    gap: 10,
    paddingRight: 16,
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
    backgroundColor: '#ffffff10',
    top: -width * 0.15,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#ffffff08',
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
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
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
    color: '#f59e0b',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  metaDot: {
    fontSize: 12,
    color: '#525252',
  },
  rentBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  rentBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  watchBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  watchBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

// ─── Icon styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  filmOuter: {
    width: 22,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filmStrip: {
    width: 6,
    borderRightWidth: 1.5,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 1,
  },
  filmStripRight: {
    borderRightWidth: 0,
    borderLeftWidth: 1.5,
  },
  filmHole: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },

  searchWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#ffffff',
    top: 0,
    left: 0,
  },
  searchHandle: {
    position: 'absolute',
    width: 2,
    height: 7,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    bottom: 0,
    right: 2,
    transform: [{ rotate: '-45deg' }],
  },

  sparkWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkBar: {
    position: 'absolute',
    backgroundColor: '#a855f7',
    borderRadius: 1,
  },
  sparkV: { width: 2, height: 14 },
  sparkH: { width: 14, height: 2 },
  sparkD1: { width: 2, height: 10, transform: [{ rotate: '45deg' }] },
  sparkD2: { width: 2, height: 10, transform: [{ rotate: '-45deg' }] },

  trendWrap: {
    width: 20,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLine: {
    position: 'absolute',
    width: 16,
    height: 2.5,
    backgroundColor: '#a855f7',
    borderRadius: 1.5,
    transform: [{ rotate: '-28deg' }, { translateY: -2 }],
  },
  trendArrowV: {
    position: 'absolute',
    width: 2.5,
    height: 8,
    backgroundColor: '#a855f7',
    borderRadius: 1,
    top: 1,
    right: 2,
  },
  trendArrowH: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#a855f7',
    borderRadius: 1,
    top: 1,
    right: 2,
  },

  awardWrap: {
    width: 18,
    height: 20,
    alignItems: 'center',
  },
  awardCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  awardRibLeft: {
    position: 'absolute',
    width: 5,
    height: 8,
    borderRadius: 2,
    bottom: 0,
    left: 2,
    transform: [{ rotate: '15deg' }],
  },
  awardRibRight: {
    position: 'absolute',
    width: 5,
    height: 8,
    borderRadius: 2,
    bottom: 0,
    right: 2,
    transform: [{ rotate: '-15deg' }],
  },
  resumeWrap:     { width: 18, height: 18, flexDirection: 'row', alignItems: 'center', gap: 2 },
  resumeBar:      { width: 3, height: 14, backgroundColor: '#a855f7', borderRadius: 2 },
  resumeTriangle: { width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 12, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#a855f7' },
});

// ─── Continue Watching card styles ────────────────────────────────────────────
const cwStyles = StyleSheet.create({
  card: {
    width: CW_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumb: {
    width: '100%',
    height: CW_WIDTH * 0.62,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  playCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5,
    borderColor: '#ffffff88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ffffff',
    marginLeft: 2,
  },
  info: {
    padding: 10,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  sub: {
    fontSize: 11,
    color: '#737373',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
});
