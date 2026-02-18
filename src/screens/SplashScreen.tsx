import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LOGO = require('../assets/logo.png');

const { width, height } = Dimensions.get('window');

// ─── Inline SVG-style icons (pure RN paths) ──────────────────────────────────
// We draw Film and Sparkles icons using View shapes to avoid extra deps.

function FilmIcon() {
  return (
    <View style={iconStyles.filmWrap}>
      {/* outer rect */}
      <View style={iconStyles.filmOuter}>
        {/* left strip */}
        <View style={iconStyles.filmStripLeft}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={iconStyles.filmHole} />
          ))}
        </View>
        {/* center screen */}
        <View style={iconStyles.filmCenter} />
        {/* right strip */}
        <View style={iconStyles.filmStripRight}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={iconStyles.filmHole} />
          ))}
        </View>
      </View>
    </View>
  );
}

function SparkleIcon({ size, color }: { size: number; color: string }) {
  // Four-point star made from two thin rectangles rotated
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[sparkleStyles.bar, { width: size * 0.15, height: size, backgroundColor: color }]} />
      <View style={[sparkleStyles.bar, sparkleStyles.horizontal, { width: size, height: size * 0.15, backgroundColor: color }]} />
      {/* diagonal bars */}
      <View style={[sparkleStyles.bar, sparkleStyles.diag1, { width: size * 0.1, height: size * 0.65, backgroundColor: color }]} />
      <View style={[sparkleStyles.bar, sparkleStyles.diag2, { width: size * 0.1, height: size * 0.65, backgroundColor: color }]} />
    </View>
  );
}

// ─── Pulsing blob ─────────────────────────────────────────────────────────────
function PulsingBlob({
  style,
  delay = 0,
  color,
}: {
  style: object;
  delay?: number;
  color: string;
}) {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[
        blobStyles.blob,
        { backgroundColor: color, opacity },
        style,
      ]}
    />
  );
}

// ─── Bouncing dot ─────────────────────────────────────────────────────────────
function BouncingDot({ delay = 0 }: { delay?: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ]),
    ).start();
  }, [delay, translateY]);

  return (
    <Animated.View style={[styles.dot, { transform: [{ translateY }] }]} />
  );
}

// ─── Pinging sparkle ──────────────────────────────────────────────────────────
function PingSparkle({
  size,
  color,
  delay = 0,
}: {
  size: number;
  color: string;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(600),
      ]),
    ).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <SparkleIcon size={size} color={color} />
    </Animated.View>
  );
}

// ─── Bouncing logo container ──────────────────────────────────────────────────
function BouncingLogo() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -12,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [translateY]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Image
        source={LOGO}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────
interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <LinearGradient
      colors={['#581c87', '#000000', '#831843']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}>
      {/* ── Animated background blobs ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PulsingBlob
          color="#a855f7"
          delay={0}
          style={blobStyles.blobTopLeft}
        />
        <PulsingBlob
          color="#ec4899"
          delay={700}
          style={blobStyles.blobBottomRight}
        />
      </View>

      {/* ── Centre content ── */}
      <View style={styles.center}>
        {/* Logo row with sparkles */}
        <View style={styles.logoWrapper}>
          {/* top-right sparkle */}
          <View style={styles.sparkleTopRight}>
            <PingSparkle size={24} color="#facc15" delay={0} />
          </View>

          <BouncingLogo />

          {/* bottom-left sparkle */}
          <View style={styles.sparkleBottomLeft}>
            <PingSparkle size={20} color="#c084fc" delay={300} />
          </View>
        </View>

        {/* App name */}
        <View style={styles.textBlock}>
          <Text style={styles.appName}>SHORTSY</Text>
          <Text style={styles.tagline}>Creator-Owned Cinema</Text>
        </View>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          <BouncingDot delay={0} />
          <BouncingDot delay={150} />
          <BouncingDot delay={300} />
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoImage: {
    width: 180,
    height: 180,
    // drop shadow on iOS
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 20,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 12,
    color: '#d8b4fe',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
});

const blobStyles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopLeft: {
    width: width * 0.6,
    height: width * 0.6,
    top: height * 0.1,
    left: -width * 0.1,
  },
  blobBottomRight: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: height * 0.05,
    right: -width * 0.15,
  },
});

const iconStyles = StyleSheet.create({
  filmWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmOuter: {
    width: 44,
    height: 34,
    borderRadius: 4,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filmStripLeft: {
    width: 10,
    height: '100%',
    borderRightWidth: 2,
    borderRightColor: '#ffffff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmStripRight: {
    width: 10,
    height: '100%',
    borderLeftWidth: 2,
    borderLeftColor: '#ffffff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmHole: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
  filmCenter: {
    flex: 1,
  },
});

const sparkleStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    borderRadius: 2,
  },
  horizontal: {
    // already absolute; width/height supplied inline
  },
  diag1: {
    transform: [{ rotate: '45deg' }],
  },
  diag2: {
    transform: [{ rotate: '-45deg' }],
  },
});
