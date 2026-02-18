import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Icons ────────────────────────────────────────────────────────────────────
function AlertCircleIcon() {
  return (
    <View style={iconStyles.alertWrap}>
      {/* Circle ring */}
      <View style={iconStyles.alertRing} />
      {/* Exclamation shaft */}
      <View style={iconStyles.alertShaft} />
      {/* Exclamation dot */}
      <View style={iconStyles.alertDot} />
    </View>
  );
}

function RefreshIcon() {
  return (
    <View style={iconStyles.refreshWrap}>
      {/* 3/4 arc */}
      <View style={iconStyles.refreshArc} />
      {/* Arrowhead tip */}
      <View style={[iconStyles.refreshArrow, iconStyles.refreshArrowTop]} />
      <View style={[iconStyles.refreshArrow, iconStyles.refreshArrowRight]} />
    </View>
  );
}

function HomeIcon() {
  return (
    <View style={iconStyles.homeWrap}>
      <View style={iconStyles.homeRoofLeft} />
      <View style={iconStyles.homeRoofRight} />
      <View style={iconStyles.homeBody}>
        <View style={iconStyles.homeDoor} />
      </View>
    </View>
  );
}

// ─── Animated button ─────────────────────────────────────────────────────────
function AnimBtn({
  onPress,
  gradient,
  outline,
  icon,
  label,
}: {
  onPress: () => void;
  gradient?: boolean;
  outline?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => press(0.96)}
        onPressOut={() => press(1)}
        activeOpacity={1}>
        {gradient ? (
          <LinearGradient
            colors={['#9333ea', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}>
            {icon}
            <Text style={styles.btnTextLight}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.btn, outline && styles.btnOutline]}>
            {icon}
            <Text style={styles.btnText}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ErrorScreen({
  title   = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  onGoHome,
}: ErrorScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        {/* Icon bubble */}
        <View style={styles.iconBubble}>
          <AlertCircleIcon />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onRetry && (
            <AnimBtn
              onPress={onRetry}
              gradient
              icon={<RefreshIcon />}
              label="Try Again"
            />
          )}
          {onGoHome && (
            <AnimBtn
              onPress={onGoHome}
              outline
              icon={<HomeIcon />}
              label="Go to Home"
            />
          )}
        </View>
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
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 24,
  },
  iconBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: 'transparent',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextLight: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

// ─── Icon styles ──────────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  // AlertCircle
  alertWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertRing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  alertShaft: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: '#ef4444',
    borderRadius: 2,
    top: 7,
  },
  alertDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    bottom: 7,
  },
  // Refresh
  refreshWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshArc: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  refreshArrow: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  refreshArrowTop: {
    width: 2,
    height: 5,
    top: 0,
    right: 2,
  },
  refreshArrowRight: {
    width: 5,
    height: 2,
    top: 0,
    right: 0,
  },
  // Home
  homeWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoofLeft: {
    position: 'absolute',
    top: 3,
    left: 1,
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '-35deg' }],
  },
  homeRoofRight: {
    position: 'absolute',
    top: 3,
    right: 1,
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '35deg' }],
  },
  homeBody: {
    width: 12,
    height: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 1,
  },
  homeDoor: {
    width: 4,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    marginBottom: -2,
  },
});
