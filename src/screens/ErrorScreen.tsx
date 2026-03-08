import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';

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
            colors={[COLORS.brand.primary, COLORS.brand.pink]}
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
          <Ionicons name="alert-circle" size={40} color={COLORS.accent.red} />
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
              icon={<Ionicons name="refresh" size={18} color={COLORS.text.primary} />}
              label="Try Again"
            />
          )}
          {onGoHome && (
            <AnimBtn
              onPress={onGoHome}
              outline
              icon={<Ionicons name="home" size={18} color={COLORS.text.primary} />}
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
    backgroundColor: COLORS.bg.black,
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
    backgroundColor: COLORS.overlay.redTint15,
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
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.tertiary,
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
    borderColor: COLORS.border.medium,
    backgroundColor: 'transparent',
  },
  btnText: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextLight: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

