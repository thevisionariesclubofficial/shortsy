import {Ionicons} from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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



// ─── Pulsing blob ─────────────────────────────────────────────────────────────
function PulsingBlob({
  style,
  color,
  delay = 0,
}: {
  style: object;
  color: string;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0.15)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.4,
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
      style={[blobStyles.blob, { backgroundColor: color, opacity }, style]}
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── WelcomeChoice ────────────────────────────────────────────────────────────
interface WelcomeChoiceProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function WelcomeChoice({ onLogin, onSignup }: WelcomeChoiceProps) {
  return (
    <View style={styles.root}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.bg.heroStart, COLORS.bg.black, COLORS.bg.heroEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Blobs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PulsingBlob
          color={COLORS.brand.violet}
          delay={0}
          style={blobStyles.blobTopLeft}
        />
        <PulsingBlob
          color={COLORS.brand.pink}
          delay={700}
          style={blobStyles.blobBottomRight}
        />
      </View>

      {/* Centre hero */}
      <View style={styles.hero}>
        {/* Logo box */}
        <View style={styles.logoBox}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Branding text */}
        <View style={styles.brandBlock}>
          <Text style={styles.appName}>SHORTSY</Text>
          <Text style={styles.tagline}>Where Short Films Earn</Text>
          <Text style={styles.description}>
            Discover award-winning short films and vertical series. Pay only for
            what you watch.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value="300+" label="Short Films" color={COLORS.brand.violetMuted} />
          <View style={styles.statDivider} />
          <StatCard value="50+" label="Series" color={COLORS.accent.pink400} />
          <View style={styles.statDivider} />
          <StatCard value="70%" label="To Creators" color={COLORS.accent.amber400} />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Get Started */}
        <Pressable
          onPress={onSignup}
          android_ripple={{ color: COLORS.overlay.ripple }}>
          <LinearGradient
            colors={[COLORS.brand.primary, COLORS.brand.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
            {/* <ArrowRightIcon /> */}
            <Ionicons name="arrow-forward" size={15} color={COLORS.text.primary} />
          </LinearGradient>
        </Pressable>

        {/* Sign In */}
        <TouchableOpacity
          onPress={onLogin}
          style={styles.outlineBtn}
          activeOpacity={0.75}>
          <Text style={styles.outlineBtnText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </Text>
      </View>
    </View>
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
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 28,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.brand.violetLight,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.75,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: COLORS.bg.nearBlack,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.bg.modal,
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border.default,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  outlineBtn: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 11,
    color: COLORS.text.dimmed,
    textAlign: 'center',
    paddingTop: 4,
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
    top: height * 0.08,
    left: -width * 0.15,
  },
  blobBottomRight: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: height * 0.05,
    right: -width * 0.2,
  },
});

