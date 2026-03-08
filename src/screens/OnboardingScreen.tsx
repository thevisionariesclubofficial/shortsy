import React, { useCallback, useRef, useState } from 'react';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
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
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────
const slides: { id: number; title: string; description: string; colors: string[]; iconName: IoniconsIconName }[] = [
  {
    id: 0,
    title: 'Premium Short Films',
    description:
      'Discover award-winning short films and vertical series from independent creators',
    colors: [COLORS.brand.violet, COLORS.brand.primary],   // purple-500 → purple-600
    iconName: 'film',
  },
  {
    id: 1,
    title: 'Pay Per Story',
    description:
      'No subscription trap. Rent only what you want to watch. Starting at just ₹29',
    colors: [COLORS.brand.pink, COLORS.brand.pinkDeep],   // pink-500 → pink-600
    iconName: 'flash',
  },
  {
    id: 2,
    title: 'Support Creators',
    description:
      '70% of your payment goes directly to filmmakers. Own their success',
    colors: [COLORS.accent.gold, COLORS.accent.orange600],   // amber-500 → orange-600
    iconName: 'heart',
  },
  {
    id: 3,
    title: 'Vertical Cinema',
    description:
      'First OTT to treat vertical content as premium storytelling, not just reels',
    colors: [COLORS.accent.blue500, COLORS.accent.cyan],   // blue-500 → cyan-600
    iconName: 'videocam',
  },
];

// ─── Chevron right icon ───────────────────────────────────────────────────────
function ChevronRight() {
  return <Ionicons name="chevron-forward" size={22} color={COLORS.text.primary} />;
}

// ─── Single slide page ────────────────────────────────────────────────────────
function SlidePage({ slide }: { slide: (typeof slides)[number] }) {
  return (
    <View style={styles.slidePage}>
      {/* Circle icon */}
      <LinearGradient
        colors={slide.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconCircle}>
        <Ionicons name={slide.iconName} size={56} color={COLORS.text.primary} />
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
        <Pressable onPress={handleNext} android_ripple={{ color: COLORS.overlay.rippleMed }}>
          <LinearGradient
            colors={[COLORS.brand.primary, COLORS.brand.pink]}
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
          backgroundColor: active ? COLORS.brand.violet : COLORS.border.medium,
        },
      ]}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
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
    color: COLORS.text.tertiary,
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
    shadowColor: COLORS.bg.black,
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
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 17,
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

