import React, { useCallback, useRef, useState } from 'react';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE   = width * 0.78;
const SPACER_SIZE = (width - ITEM_SIZE) / 2;

// ─── Slide data (3 steps) ─────────────────────────────────────────────────────
type Slide = {
  key: string;
  title: string;
  description: string;
  tags: string[];
  iconName: IoniconsIconName;
  cardColors: [string, string];
  bgColors:   [string, string, string];
};

const SLIDES: Slide[] = [
  {
    key: 's1',
    title: 'Premium Short Films',
    description:
      'Award-winning short films from independent creators. Cinematic storytelling — in minutes.',
    tags: ['Short Films', 'Award-Winning'],
    iconName: 'film',
    cardColors: [COLORS.brand.violet, COLORS.brand.primaryDark],
    bgColors:   [COLORS.bg.onboardingStart, COLORS.bg.splash, COLORS.brand.primaryDark],
  },
  {
    key: 's2',
    title: 'Pay Per Story',
    description:
      'No subscription trap. Rent only what you love — starting at just ₹29.',
    tags: ['Rent & Watch', '₹29 Onwards'],
    iconName: 'flash',
    cardColors: [COLORS.brand.pink, COLORS.brand.pinkDeep],
    bgColors:   [COLORS.bg.legalEnd, COLORS.bg.legal, COLORS.brand.pinkDeep],
  },
  {
    key: 's3',
    title: 'Support Creators',
    description:
      '70% of your payment goes directly to filmmakers. Watch great stories, fund greater ones.',
    tags: ['70% to Creators', 'Vertical Cinema'],
    iconName: 'heart',
    cardColors: [COLORS.accent.gold, COLORS.accent.amber600],
    bgColors:   [COLORS.bg.stoneBlack, COLORS.accent.amber900, COLORS.accent.orange600],
  },
];

// FlatList data: left spacer → slides → right spacer
type SpacerItem = { key: string; isSpacerItem: true };
type ListItem   = Slide | SpacerItem;

const LIST_DATA: ListItem[] = [
  { key: 'left-spacer',  isSpacerItem: true },
  ...SLIDES,
  { key: 'right-spacer', isSpacerItem: true },
];

// ─── Poster images per slide ────────────────────────────────────────────────────
// 9 portrait images per slide (3 columns × 3 rows) sourced from picsum.
// Replace these URLs with real TMDB / CDN poster URLs in production.
const SLIDE_POSTERS: string[][] = [
  // Slide 1 — Short Films
  [103, 180, 250, 328, 432, 517, 619, 742, 891].map(
    s => `https://picsum.photos/seed/${s}/200/300`,
  ),
  // Slide 2 — Pay Per Story
  [113, 190, 267, 345, 447, 530, 635, 760, 870].map(
    s => `https://picsum.photos/seed/${s}/200/300`,
  ),
  // Slide 3 — Support Creators
  [123, 201, 287, 365, 467, 550, 655, 780, 850].map(
    s => `https://picsum.photos/seed/${s}/200/300`,
  ),
];

// Per-slide colour wash that tints the poster mosaic
const SLIDE_TINTS = [
  'rgba(109,40,217,0.38)',  // violet — Short Films
  'rgba(219,39,119,0.38)',  // pink   — Pay Per Story
  'rgba(217,119,6,0.38)',   // amber  — Support Creators
];

// ─── Poster mosaic ────────────────────────────────────────────────────────────
function PosterGrid({ posters, tint }: { posters: string[]; tint: string }) {
  const columns = [
    posters.slice(0, 3),
    posters.slice(3, 6),
    posters.slice(6, 9),
  ];
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 3-column poster grid — height: height ensures full-screen coverage */}
      <View
        style={{
          height,
          flexDirection: 'row',
          gap: 4,
          paddingHorizontal: 4,
          overflow: 'hidden',
        }}>
        {columns.map((col, ci) => (
          // middle column offset so rows feel staggered
          <View key={ci} style={{ flex: 1, gap: 4, marginTop: ci === 1 ? -44 : 0, height: height + (ci === 1 ? 44 : 0) }}>
            {col.map((uri, ii) => (
              <View
                key={ii}
                style={{
                  width: '100%',
                  flex: 1,          // stretch to fill column height evenly
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: '#111',
                }}>
                <Image
                  source={{ uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* Subtle per-poster darkening for depth */}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0,0,0,0.22)' },
                  ]}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
      {/* Slide colour tint overlay */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
    </View>
  );
}

// ─── Animated background ──────────────────────────────────────────────────────
function AnimatedBackground({ scrollX }: { scrollX: Animated.Value }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bg.black }]} />
      {SLIDES.map((slide, index) => {
        const inputRange = [
          (index - 1) * ITEM_SIZE,
          index       * ITEM_SIZE,
          (index + 1) * ITEM_SIZE,
        ];
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View key={slide.key} style={[StyleSheet.absoluteFill, { opacity }]}>
            <PosterGrid posters={SLIDE_POSTERS[index]} tint={SLIDE_TINTS[index]} />
          </Animated.View>
        );
      })}
      {/* Bottom fade for readability — semi-transparent so posters bleed through */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.88)']}
        style={styles.bgFade}
      />
    </View>
  );
}

// ─── Animated dot ─────────────────────────────────────────────────────────────
function AnimatedDot({ active }: { active: boolean }) {
  const dotWidth = useRef(new Animated.Value(active ? 28 : 8)).current;

  React.useEffect(() => {
    Animated.timing(dotWidth, {
      toValue: active ? 28 : 8,
      duration: 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [active, dotWidth]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: dotWidth,
          backgroundColor: active ? COLORS.brand.violet : COLORS.overlay.white20,
        },
      ]}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const scrollX     = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<ListItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: next * ITEM_SIZE, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex, isLast, onComplete]);

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if ((item as SpacerItem).isSpacerItem) {
        return <View style={{ width: SPACER_SIZE }} />;
      }

      const slide = item as Slide;
      const inputRange = [
        (index - 2) * ITEM_SIZE,
        (index - 1) * ITEM_SIZE,
        index       * ITEM_SIZE,
      ];

      const translateY = scrollX.interpolate({
        inputRange,
        outputRange: [60, 0, 60],
        extrapolate: 'clamp',
      });
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.87, 1, 0.87],
        extrapolate: 'clamp',
      });
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.45, 1, 0.45],
        extrapolate: 'clamp',
      });

      return (
        <View style={styles.itemWrap}>
          <Animated.View style={[styles.card, { opacity, transform: [{ scale }, { translateY }] }]}>
            {/* Coloured accent strip */}
            <LinearGradient
              colors={slide.cardColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardStrip}
            />
            {/* Icon */}
            <View style={styles.iconWrap}>
              <LinearGradient
                colors={slide.cardColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}>
                <Ionicons name={slide.iconName} size={54} color={COLORS.text.primary} />
              </LinearGradient>
            </View>
            {/* Text */}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{slide.title}</Text>
              <Text style={styles.cardDesc}>{slide.description}</Text>
              <View style={styles.tagsRow}>
                {slide.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      );
    },
    [scrollX],
  );

  return (
    <View style={styles.root}>
      <AnimatedBackground scrollX={scrollX} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onComplete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Carousel */}
      <Animated.FlatList
        ref={flatListRef as React.RefObject<FlatList<ListItem>>}
        data={LIST_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate={0}
        bounces={false}
        scrollEventThrottle={16}
        keyExtractor={item => item.key}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE);
          setActiveIndex(Math.max(0, Math.min(index, SLIDES.length - 1)));
        }}
        renderItem={renderItem}
        style={styles.flatList}
      />

      {/* Bottom nav */}
      <View style={styles.navArea}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <AnimatedDot key={i} active={i === activeIndex} />
          ))}
        </View>

        <Pressable onPress={handleNext} android_ripple={{ color: COLORS.overlay.rippleMed }}>
          <LinearGradient
            colors={[COLORS.brand.primary, COLORS.brand.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.text.primary} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 44,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: COLORS.text.tertiary,
    fontSize: 16,
  },
  bgFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
  },
  flatList: {
    flex: 1,
  },
  itemWrap: {
    width: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.bg.elevated,
    borderRadius: 28,
    overflow: 'hidden',
    paddingBottom: 28,
    shadowColor: COLORS.bg.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 18,
  },
  cardStrip: {
    height: 5,
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 22,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    backgroundColor: COLORS.overlay.white07,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: '500',
  },
  navArea: {
    paddingHorizontal: 24,
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
