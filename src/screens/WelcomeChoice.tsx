import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// ─── Film icon (reused from SplashScreen style) ───────────────────────────────
function FilmIcon({ size = 48 }: { size?: number }) {
  const holeSize = Math.round(size * 0.09);
  const stripW = Math.round(size * 0.2);
  return (
    <View
      style={{
        width: size,
        height: size * 0.75,
        borderRadius: size * 0.09,
        borderWidth: size * 0.05,
        borderColor: '#fff',
        flexDirection: 'row',
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: stripW,
          borderRightWidth: size * 0.04,
          borderRightColor: '#fff',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 2,
        }}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={{
              width: holeSize,
              height: holeSize,
              borderRadius: 2,
              backgroundColor: '#fff',
            }}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View
        style={{
          width: stripW,
          borderLeftWidth: size * 0.04,
          borderLeftColor: '#fff',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 2,
        }}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={{
              width: holeSize,
              height: holeSize,
              borderRadius: 2,
              backgroundColor: '#fff',
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Arrow right icon ─────────────────────────────────────────────────────────
function ArrowRightIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={iconStyles.arrowTop} />
      <View style={iconStyles.arrowBottom} />
    </View>
  );
}

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
        colors={['#1a0533', '#000000', '#1a0519']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Blobs */}
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

      {/* Centre hero */}
      <View style={styles.hero}>
        {/* Logo box */}
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}>
          <FilmIcon size={48} />
        </LinearGradient>

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
          <StatCard value="300+" label="Short Films" color="#c084fc" />
          <View style={styles.statDivider} />
          <StatCard value="50+" label="Series" color="#f472b6" />
          <View style={styles.statDivider} />
          <StatCard value="70%" label="To Creators" color="#fbbf24" />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Get Started */}
        <Pressable
          onPress={onSignup}
          android_ripple={{ color: '#ffffff20' }}>
          <LinearGradient
            colors={['#9333ea', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <ArrowRightIcon />
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
    backgroundColor: '#000000',
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
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 44,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: '#d8b4fe',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.75,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#0d0d0d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
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
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#262626',
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
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  outlineBtn: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#404040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 11,
    color: '#525252',
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

const iconStyles = StyleSheet.create({
  arrowWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowStem: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  arrowTop: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    right: 3,
    top: 5,
    transform: [{ rotate: '45deg' }],
  },
  arrowBottom: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    right: 3,
    bottom: 5,
    transform: [{ rotate: '-45deg' }],
  },
});
