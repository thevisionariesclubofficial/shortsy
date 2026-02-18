import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Film strip icon (pure View) ─────────────────────────────────────────────
function FilmIcon() {
  return (
    <View style={iconStyles.filmOuter}>
      {/* Left perforations strip */}
      <View style={[iconStyles.filmStrip, iconStyles.filmStripLeft]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={iconStyles.filmHole} />
        ))}
      </View>
      {/* Centre frame area */}
      <View style={iconStyles.filmCenter} />
      {/* Right perforations strip */}
      <View style={[iconStyles.filmStrip, iconStyles.filmStripRight]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={iconStyles.filmHole} />
        ))}
      </View>
    </View>
  );
}

// ─── Bouncing dot ─────────────────────────────────────────────────────────────
function BounceDot({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, {
          toValue: -8,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, y]);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: y }] }]}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoadingScreenProps {
  message?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.75,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.root}>
      {/* Pulsing gradient icon */}
      <Animated.View style={[styles.iconWrap, { opacity: pulse }]}>
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGrad}>
          <FilmIcon />
        </LinearGradient>
      </Animated.View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Bouncing dots */}
      <View style={styles.dots}>
        <BounceDot delay={0} />
        <BounceDot delay={150} />
        <BounceDot delay={300} />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#9333ea',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  iconGrad: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  message: {
    fontSize: 14,
    color: '#a3a3a3',
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
});

// ─── Icon styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  filmOuter: {
    width: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    overflow: 'hidden',
  },
  filmStrip: {
    width: 8,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 4,
  },
  filmStripLeft: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  filmStripRight: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  filmCenter: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filmHole: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
