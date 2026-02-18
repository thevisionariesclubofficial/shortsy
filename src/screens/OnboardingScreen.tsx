import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────
const slides = [
  {
    id: 0,
    title: 'Premium Short Films',
    description:
      'Discover award-winning short films and vertical series from independent creators',
    colors: ['#a855f7', '#9333ea'],   // purple-500 → purple-600
    Icon: FilmIcon,
  },
  {
    id: 1,
    title: 'Pay Per Story',
    description:
      'No subscription trap. Rent only what you want to watch. Starting at just ₹29',
    colors: ['#ec4899', '#db2777'],   // pink-500 → pink-600
    Icon: ZapIcon,
  },
  {
    id: 2,
    title: 'Support Creators',
    description:
      '70% of your payment goes directly to filmmakers. Own their success',
    colors: ['#f59e0b', '#ea580c'],   // amber-500 → orange-600
    Icon: HeartIcon,
  },
  {
    id: 3,
    title: 'Vertical Cinema',
    description:
      'First OTT to treat vertical content as premium storytelling, not just reels',
    colors: ['#3b82f6', '#06b6d4'],   // blue-500 → cyan-600
    Icon: TrendingUpIcon,
  },
];

// ─── Icon components (pure RN Views) ─────────────────────────────────────────

function FilmIcon() {
  return (
    <View style={iconStyles.filmOuter}>
      <View style={iconStyles.filmStripLeft}>
        {[0, 1, 2, 3].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
      <View style={{ flex: 1 }} />
      <View style={iconStyles.filmStripRight}>
        {[0, 1, 2, 3].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
    </View>
  );
}

function ZapIcon() {
  // Lightning bolt: two slanted thin rectangles
  return (
    <View style={iconStyles.zapWrap}>
      <View style={iconStyles.zapTop} />
      <View style={iconStyles.zapBottom} />
    </View>
  );
}

function HeartIcon() {
  // Heart using two rounded squares + rotated diamond
  return (
    <View style={iconStyles.heartWrap}>
      <View style={[iconStyles.heartLobe, iconStyles.heartLobeLeft]} />
      <View style={[iconStyles.heartLobe, iconStyles.heartLobeRight]} />
      <View style={iconStyles.heartTip} />
    </View>
  );
}

function TrendingUpIcon() {
  // Arrow line going up-right
  return (
    <View style={iconStyles.trendWrap}>
      <View style={iconStyles.trendLine1} />
      <View style={iconStyles.trendLine2} />
      <View style={iconStyles.trendArrowV} />
      <View style={iconStyles.trendArrowH} />
    </View>
  );
}

// ─── Chevron right icon ───────────────────────────────────────────────────────
function ChevronRight() {
  return (
    <View style={chevronStyles.wrap}>
      <View style={chevronStyles.top} />
      <View style={chevronStyles.bottom} />
    </View>
  );
}

// ─── Single slide page ────────────────────────────────────────────────────────
function SlidePage({ slide }: { slide: (typeof slides)[number] }) {
  const { Icon } = slide;
  return (
    <View style={styles.slidePage}>
      {/* Circle icon */}
      <LinearGradient
        colors={slide.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconCircle}>
        <Icon />
      </LinearGradient>

      {/* Title + description */}
      <View style={styles.textBlock}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>
      </View>
    </View>
  );
}

// ─── Main OnboardingScreen ────────────────────────────────────────────────────
interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = currentSlide === slides.length - 1;

  // Scroll programmatically when Next is tapped
  const handleNext = useCallback(() => {
    if (!isLast) {
      const next = currentSlide + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentSlide(next);
    } else {
      onComplete();
    }
  }, [currentSlide, isLast, onComplete]);

  // Track current slide when user swipes
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      if (index !== currentSlide) {
        setCurrentSlide(index);
      }
    },
    [currentSlide],
  );

  return (
    <View style={styles.root}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          onPress={onComplete}
          style={styles.skipBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Swipeable slide area */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {slides.map(slide => (
          <SlidePage key={slide.id} slide={slide} />
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navArea}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <AnimatedDot key={index} active={index === currentSlide} />
          ))}
        </View>

        {/* Next / Get Started button */}
        <Pressable onPress={handleNext} android_ripple={{ color: '#ffffff30' }}>
          <LinearGradient
            colors={['#9333ea', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Animated dot ─────────────────────────────────────────────────────────────
function AnimatedDot({ active }: { active: boolean }) {
  const width = useRef(new Animated.Value(active ? 32 : 8)).current;

  React.useEffect(() => {
    Animated.timing(width, {
      toValue: active ? 32 : 8,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // width is a layout prop
    }).start();
  }, [active, width]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width,
          backgroundColor: active ? '#a855f7' : '#404040',
        },
      ]}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: '#a3a3a3',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: -32, // cancel root horizontal padding so pages are full-width
  },
  scrollContent: {
    // width is set per-page inside SlidePage
  },
  slidePage: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
    maxWidth: width * 0.8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 17,
    color: '#d4d4d4',
    textAlign: 'center',
    lineHeight: 26,
  },
  navArea: {
    gap: 24,
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

// ─── Icon sub-styles ──────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  // Film
  filmOuter: {
    width: 58,
    height: 44,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#fff',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filmStripLeft: {
    width: 12,
    borderRightWidth: 2.5,
    borderRightColor: '#fff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 3,
  },
  filmStripRight: {
    width: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: '#fff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 3,
  },
  filmHole: {
    width: 5,
    height: 5,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },

  // Zap / Lightning
  zapWrap: {
    width: 40,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zapTop: {
    position: 'absolute',
    width: 6,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 3,
    top: 0,
    transform: [{ rotate: '20deg' }, { translateX: 6 }],
  },
  zapBottom: {
    position: 'absolute',
    width: 6,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 3,
    bottom: 0,
    transform: [{ rotate: '20deg' }, { translateX: -6 }],
  },

  // Heart
  heartWrap: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  heartLobe: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    top: 0,
  },
  heartLobeLeft: { left: 2 },
  heartLobeRight: { right: 2 },
  heartTip: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
    top: 14,
    borderRadius: 4,
  },

  // Trending up
  trendWrap: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendLine1: {
    position: 'absolute',
    width: 50,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    top: 24,
    transform: [{ rotate: '-28deg' }, { translateY: -8 }],
  },
  trendLine2: {
    position: 'absolute',
    width: 24,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    bottom: 10,
    left: 4,
    transform: [{ rotate: '-6deg' }],
  },
  trendArrowV: {
    position: 'absolute',
    width: 5,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
    top: 4,
    right: 6,
  },
  trendArrowH: {
    position: 'absolute',
    width: 16,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 2,
    top: 4,
    right: 6,
  },
});

const chevronStyles = StyleSheet.create({
  wrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: {
    position: 'absolute',
    width: 10,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
    top: 4,
    left: 4,
    transform: [{ rotate: '45deg' }],
  },
  bottom: {
    position: 'absolute',
    width: 10,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
    bottom: 4,
    left: 4,
    transform: [{ rotate: '-45deg' }],
  },
});
