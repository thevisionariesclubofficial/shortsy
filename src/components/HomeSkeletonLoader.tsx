/**
 * HomeSkeletonLoader
 *
 * OTT-style animated skeleton that mirrors the HomePage layout:
 *   • Full-height hero block
 *   • 3 horizontal section rows (cards + genre pills)
 *
 * Uses a travelling shimmer highlight (LinearGradient sweeping left → right)
 * driven by a single looping Animated.Value so all pieces sync perfectly.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');
const HERO_H     = height * 0.68;
const CARD_W     = width * 0.38;
const CARD_H     = CARD_W * 1.52;   // portrait card  (2:3 ish)
const WIDE_W     = width * 0.52;
const WIDE_H     = WIDE_W * 0.62;   // landscape card (continue watching)
const PILL_W     = 80;
const SHIMMER_W  = width * 1.4;     // wider than screen so the sweep looks smooth

// ─── Core shimmer ─────────────────────────────────────────────────────────────
/**
 * A single looping shimmer value (0 → 1).  Pass it down to every
 * ShimmerBox so they all animate in lock-step without individual timers.
 */
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

// ─── Shimmer box ──────────────────────────────────────────────────────────────
function ShimmerBox({
  w,
  h,
  r = 10,
  shimmer,
}: {
  w: number | '100%';
  h: number;
  r?: number;
  shimmer: Animated.Value;
}) {
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_W, SHIMMER_W],
  });

  return (
    <View
      style={[
        {
          width: w === '100%' ? '100%' : w,
          height: h,
          borderRadius: r,
          backgroundColor: COLORS.bg.elevated,
          overflow: 'hidden',
        },
      ]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.07)',
            'rgba(255,255,255,0.14)',
            'rgba(255,255,255,0.07)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SHIMMER_W, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Section skeleton (title line + horizontal card row) ──────────────────────
function SectionSkeleton({
  shimmer,
  cardW,
  cardH,
  count = 4,
  pill = false,
}: {
  shimmer: Animated.Value;
  cardW: number;
  cardH: number;
  count?: number;
  pill?: boolean;
}) {
  return (
    <View style={sk.section}>
      {/* Section header: icon stub + title stub */}
      <View style={sk.sectionHeader}>
        <ShimmerBox w={20} h={20} r={6} shimmer={shimmer} />
        <View style={{ width: 8 }} />
        <ShimmerBox w={130} h={16} r={6} shimmer={shimmer} />
      </View>
      {/* Horizontal row */}
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[sk.hRow, pill && { alignItems: 'center' }]}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={{ marginRight: 12 }}>
            <ShimmerBox
              w={cardW}
              h={cardH}
              r={pill ? cardH / 2 : 12}
              shimmer={shimmer}
            />
            {!pill && (
              <View style={{ marginTop: 8, gap: 5 }}>
                <ShimmerBox w={cardW * 0.75} h={12} r={4} shimmer={shimmer} />
                <ShimmerBox w={cardW * 0.5}  h={10} r={4} shimmer={shimmer} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function HomeSkeletonLoader() {
  const shimmer = useShimmer();

  return (
    <View style={sk.root}>
      {/* ── Hero skeleton ─────────────────────────────────────────────────── */}
      <View style={[sk.hero, { height: HERO_H }]}>
        <ShimmerBox w="100%" h={HERO_H} r={0} shimmer={shimmer} />
        {/* Simulated badge + play-btn overlay at bottom of hero */}
        <View style={sk.heroOverlay}>
          {/* Genre badge */}
          <ShimmerBox w={70} h={22} r={11} shimmer={shimmer} />
          <View style={{ height: 10 }} />
          {/* Title */}
          <ShimmerBox w={width * 0.62} h={26} r={6} shimmer={shimmer} />
          <View style={{ height: 8 }} />
          <ShimmerBox w={width * 0.45} h={16} r={5} shimmer={shimmer} />
          <View style={{ height: 22 }} />
          {/* CTA buttons */}
          <View style={sk.heroBtns}>
            <ShimmerBox w={130} h={44} r={10} shimmer={shimmer} />
            <ShimmerBox w={100} h={44} r={10} shimmer={shimmer} />
          </View>
        </View>
      </View>

      {/* ── Content rows ──────────────────────────────────────────────────── */}
      <ScrollView
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Genre pills */}
        <SectionSkeleton
          shimmer={shimmer}
          cardW={PILL_W}
          cardH={36}
          count={5}
          pill
        />

        {/* Vertical series — portrait cards */}
        <SectionSkeleton
          shimmer={shimmer}
          cardW={CARD_W}
          cardH={CARD_H}
          count={3}
        />

        {/* Short films — portrait cards */}
        <SectionSkeleton
          shimmer={shimmer}
          cardW={CARD_W}
          cardH={CARD_H}
          count={3}
        />

        {/* Festival winners — landscape cards */}
        <SectionSkeleton
          shimmer={shimmer}
          cardW={WIDE_W}
          cardH={WIDE_H}
          count={3}
        />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sk = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 28,
    left: 18,
    right: 18,
  },
  heroBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  hRow: {
    paddingHorizontal: 18,
    gap: 0,   // gap handled by marginRight on each item
  },
});
