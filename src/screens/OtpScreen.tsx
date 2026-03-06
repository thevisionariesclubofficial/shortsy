import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { confirmOtp, resendOtp } from '../services/authService';

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[spinnerStyles.ring, { transform: [{ rotate }] }]} />
  );
}

// ─── OTP Digit Box ────────────────────────────────────────────────────────────
interface DigitBoxProps {
  value: string;
  focused: boolean;
}

function DigitBox({ value, focused }: DigitBoxProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (focused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [focused, pulse]);

  return (
    <View style={[digitStyles.box, focused && digitStyles.boxFocused, value && digitStyles.boxFilled]}>
      {value ? (
        <Text style={digitStyles.digit}>{value}</Text>
      ) : focused ? (
        <Animated.View style={[digitStyles.cursor, { opacity: pulse }]} />
      ) : null}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface OtpScreenProps {
  email: string;
  password: string;
  onVerified: () => void;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_DELAY = 60; // seconds

export function OtpScreen({ email, password, onVerified, onBack }: OtpScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    // Focus first box
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_DELAY);
    setResendSuccess(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleDigitChange = useCallback((text: string, index: number) => {
    setError('');

    // Handle paste (text longer than 1 char)
    if (text.length > 1) {
      const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = [...Array(OTP_LENGTH).fill('')];
      cleaned.split('').forEach((ch, i) => { newDigits[i] = ch; });
      setDigits(newDigits);
      const nextFocus = Math.min(cleaned.length, OTP_LENGTH - 1);
      setFocusedIndex(nextFocus);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      const next = index + 1;
      setFocusedIndex(next);
      inputRefs.current[next]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace') {
      setError('');
      if (digits[index]) {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        // Move to previous and clear it
        const prev = index - 1;
        const newDigits = [...digits];
        newDigits[prev] = '';
        setDigits(newDigits);
        setFocusedIndex(prev);
        inputRefs.current[prev]?.focus();
      }
    }
  }, [digits]);

  const code = digits.join('');
  const isComplete = code.length === OTP_LENGTH;

  const handleVerify = useCallback(async () => {
    if (!isComplete || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      await confirmOtp({ email, code, password });
      onVerified();
    } catch (err: any) {
      const errCode = err?.code ?? '';
      if (errCode === 'INVALID_OTP') {
        setError('Incorrect code. Please check and try again.');
      } else if (errCode === 'OTP_EXPIRED') {
        setError('Code has expired. Request a new one below.');
      } else {
        setError(err?.message ?? 'Verification failed. Please try again.');
      }
      // Shake the digit boxes
      setDigits(Array(OTP_LENGTH).fill(''));
      setFocusedIndex(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  }, [isComplete, isLoading, email, code, password, onVerified]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setResendSuccess(false);
    try {
      await resendOtp({ email });
      setResendSuccess(true);
      setDigits(Array(OTP_LENGTH).fill(''));
      setFocusedIndex(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      startCountdown();
    } catch (err: any) {
      Alert.alert('Failed to resend', err?.message ?? 'Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending, email, startCountdown]);

  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c);

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#1a0533', '#000000', '#1a0519']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Decorative background orbs */}
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />

      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="chevron-back" size={22} color="#ffffff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={styles.content}>
          {/* Mail icon */}
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={['#9333ea', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}>
              <Ionicons name="mail" size={32} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.email}>{maskedEmail}</Text>

          {/* OTP Input Row */}
          <View style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <View key={i} style={styles.digitWrap}>
                <TextInput
                  ref={ref => { inputRefs.current[i] = ref; }}
                  style={styles.hiddenInput}
                  value={digits[i]}
                  onChangeText={text => handleDigitChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  onFocus={() => setFocusedIndex(i)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  caretHidden
                  selectTextOnFocus
                  contextMenuHidden
                />
                <DigitBox value={digits[i]} focused={focusedIndex === i} />
              </View>
            ))}
          </View>

          {/* Error message */}
          {!!error && (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success message */}
          {resendSuccess && !error && (
            <View style={styles.successWrap}>
              <Ionicons name="checkmark" size={16} color="#34d399" />
              <Text style={styles.successText}>New code sent to your email</Text>
            </View>
          )}

          {/* Verify button */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={isComplete ? 0.8 : 1}
            disabled={!isComplete || isLoading}
            style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}>
            <LinearGradient
              colors={isComplete ? ['#9333ea', '#ec4899'] : ['#374151', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyGradient}>
              {isLoading ? (
                <Spinner />
              ) : (
                <Text style={[styles.verifyText, !isComplete && styles.verifyTextDisabled]}>
                  Verify Email
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend section */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
                {isResending ? (
                  <View style={styles.resendSpinnerWrap}>
                    <Spinner />
                    <Text style={styles.resendLink}> Sending…</Text>
                  </View>
                ) : (
                  <Text style={styles.resendLink}>Resend Code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Help text */}
          <Text style={styles.helpText}>
            The code expires in 10 minutes. Check your spam folder if you don't see it.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  orb1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(147,51,234,0.12)',
  },
  orb2: {
    position: 'absolute',
    bottom: 60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },

  // Icon
  iconWrap: {
    marginBottom: 28,
    shadowColor: '#9333ea',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#c084fc',
    marginTop: 4,
    marginBottom: 36,
  },

  // OTP Row
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  digitWrap: {
    position: 'relative',
    width: 46,
    height: 56,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 10,
  },

  // Error / Success
  errorWrap: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    maxWidth: 320,
    width: '100%',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  successWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  successText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '500',
  },

  // Verify button
  verifyBtn: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: '#9333ea',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  verifyBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  verifyTextDisabled: {
    color: '#6b7280',
  },

  // Resend
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a855f7',
  },
  resendSpinnerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Help
  helpText: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});

const digitStyles = StyleSheet.create({
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: '#9333ea',
    backgroundColor: 'rgba(147,51,234,0.08)',
  },
  boxFilled: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: '#a855f7',
    borderRadius: 1,
  },
});

const spinnerStyles = StyleSheet.create({
  ring: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#ffffff',
  },
});
