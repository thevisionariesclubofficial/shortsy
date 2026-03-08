import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

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
          colors={[COLORS.brand.primary, COLORS.brand.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGrad}>
          <Ionicons name="film" size={32} color={COLORS.text.primary} />
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
    backgroundColor: COLORS.bg.black,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.brand.primary,
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
    color: COLORS.text.tertiary,
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
    backgroundColor: COLORS.brand.violet,
  },
});

