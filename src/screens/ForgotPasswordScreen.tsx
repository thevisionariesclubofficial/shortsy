import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { forgotPassword, confirmResetPassword } from '../services/authService';
import { COLORS } from '../constants/colors';

type Step = 'email' | 'code' | 'newPassword' | 'success';

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color = COLORS.text.primary }: { color?: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View style={[spinnerStyles.ring, { borderColor: `${color}40`, borderTopColor: color, transform: [{ rotate }] }]} />
  );
}

// ─── Shared gradient background ───────────────────────────────────────────────
function GradientBg() {
  return (
    <LinearGradient
      colors={[COLORS.bg.heroStart, COLORS.bg.black, COLORS.bg.heroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ step }: { step: Step }) {
  const idx = { email: 0, code: 1, newPassword: 2, success: 2 }[step];
  return (
    <View style={stepStyles.row}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={[
            stepStyles.dot,
            i === idx && stepStyles.dotActive,
            i < idx  && stepStyles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessView({ onBack }: { onBack: () => void }) {
  return (
    <View style={successStyles.root}>
      <GradientBg />
      <View style={successStyles.iconWrap}>
        <Ionicons name="checkmark-circle" size={64} color={COLORS.accent.green} />
      </View>
      <View style={successStyles.textBlock}>
        <Text style={successStyles.title}>Password Updated!</Text>
        <Text style={successStyles.body}>
          Your password has been reset successfully. You can now sign in with your new password.
        </Text>
      </View>
      <TouchableOpacity onPress={onBack} style={successStyles.backBtn} activeOpacity={0.85}>
        <Text style={successStyles.backBtnText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ForgotPasswordScreen ─────────────────────────────────────────────────────
interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [step, setStep]                   = useState<Step>('email');
  const [email, setEmail]                 = useState('');
  const [code, setCode]                   = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');
  const [focusedField, setFocusedField]   = useState('');

  // ── Step 1: send code ──────────────────────────────────────────────────────
  const handleSendCode = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await forgotPassword({ email: email.trim() });
      setStep('code');
    } catch {
      // Anti-enumeration: always advance (network errors only reach here)
      setStep('code');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: validate code locally, advance to new password ────────────────
  const handleVerifyCode = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter the reset code sent to your email.');
      return;
    }
    setError('');
    setStep('newPassword');
  };

  // ── Step 3: confirm reset with code + new password ─────────────────────────
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPwd) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await confirmResetPassword({ email: email.trim(), code: code.trim(), newPassword });
      setStep('success');
    } catch (err: any) {
      const c = err?.code ?? '';
      if (c === 'INVALID_OTP') {
        setError('The reset code is incorrect. Please go back and check it.');
      } else if (c === 'OTP_EXPIRED') {
        setError('The reset code has expired. Please request a new one.');
      } else {
        setError(err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return <SuccessView onBack={onBack} />;
  }

  // ── Step meta ──────────────────────────────────────────────────────────────
  const stepMeta = {
    email: {
      icon: 'mail' as const,
      iconColor: COLORS.brand.violet,
      title: 'Forgot Password?',
      subtitle: "Enter your email and we'll send you a reset code.",
    },
    code: {
      icon: 'key' as const,
      iconColor: COLORS.accent.gold,
      title: 'Enter Reset Code',
      subtitle: `We sent a 6-digit code to ${email}. Enter it below.`,
    },
    newPassword: {
      icon: 'lock-closed' as const,
      iconColor: COLORS.accent.green,
      title: 'Set New Password',
      subtitle: 'Choose a strong password with at least 8 characters.',
    },
  }[step];

  const headerTitle = {
    email: 'Forgot Password',
    code: 'Verify Code',
    newPassword: 'New Password',
  }[step];

  const handleBack = () => {
    setError('');
    if (step === 'code')        { setStep('email');       return; }
    if (step === 'newPassword') { setStep('code');        return; }
    onBack();
  };

  return (
    <View style={styles.root}>
      <GradientBg />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>

          {/* Step dots */}
          <StepDots step={step} />

          {/* Centre content */}
          <View style={styles.centre}>
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: `${stepMeta.iconColor}20` }]}>
              <Ionicons name={stepMeta.icon} size={32} color={stepMeta.iconColor} />
            </View>

            <Text style={styles.title}>{stepMeta.title}</Text>
            <Text style={styles.subtitle}>{stepMeta.subtitle}</Text>

            {/* ── STEP 1: Email ────────────────────────────────────────────── */}
            {step === 'email' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputRow, focusedField === 'email' && styles.inputRowFocused]}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="mail" size={20} color={COLORS.text.muted} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor={COLORS.text.muted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                    />
                  </View>
                </View>

                {error !== '' && <ErrorBox message={error} />}

                <Pressable
                  onPress={handleSendCode}
                  disabled={isLoading || !email.trim()}
                  android_ripple={{ color: COLORS.overlay.ripple }}
                  style={{ width: '100%' }}>
                  <LinearGradient
                    colors={isLoading || !email.trim() ? [COLORS.brand.primaryDeep, COLORS.brand.pinkDark] : [COLORS.brand.primary, COLORS.brand.pink]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.primaryBtn}>
                    {isLoading
                      ? <View style={styles.loadingRow}><Spinner /><Text style={styles.primaryBtnText}>Sending...</Text></View>
                      : <Text style={styles.primaryBtnText}>Send Reset Code</Text>}
                  </LinearGradient>
                </Pressable>
              </>
            )}

            {/* ── STEP 2: Code ─────────────────────────────────────────────── */}
            {step === 'code' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Reset Code</Text>
                  <View style={[styles.inputRow, focusedField === 'code' && styles.inputRowFocused]}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="keypad" size={20} color={COLORS.text.muted} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit code"
                      placeholderTextColor={COLORS.text.muted}
                      value={code}
                      onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField('')}
                    />
                  </View>
                </View>

                {error !== '' && <ErrorBox message={error} />}

                <Pressable
                  onPress={handleVerifyCode}
                  disabled={!code.trim()}
                  android_ripple={{ color: COLORS.overlay.ripple }}
                  style={{ width: '100%' }}>
                  <LinearGradient
                    colors={!code.trim() ? [COLORS.brand.primaryDeep, COLORS.brand.pinkDark] : [COLORS.brand.primary, COLORS.brand.pink]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Continue</Text>
                  </LinearGradient>
                </Pressable>

                <TouchableOpacity onPress={handleSendCode} style={styles.resendWrap} disabled={isLoading}>
                  <Text style={styles.resendText}>
                    Didn't receive it?{' '}
                    <Text style={styles.resendLink}>Resend code</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 3: New Password ──────────────────────────────────────── */}
            {step === 'newPassword' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={[styles.inputRow, focusedField === 'new' && styles.inputRowFocused]}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed" size={20} color={COLORS.text.muted} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="At least 8 characters"
                      placeholderTextColor={COLORS.text.muted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('new')}
                      onBlur={() => setFocusedField('')}
                    />
                    <TouchableOpacity onPress={() => setShowNew(v => !v)} style={styles.eyeBtn}>
                      <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color={COLORS.text.muted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputRow, focusedField === 'confirm' && styles.inputRowFocused]}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed" size={20} color={COLORS.text.muted} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Repeat your password"
                      placeholderTextColor={COLORS.text.muted}
                      value={confirmPwd}
                      onChangeText={setConfirmPwd}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField('')}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                      <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={COLORS.text.muted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {error !== '' && <ErrorBox message={error} />}

                <Pressable
                  onPress={handleUpdatePassword}
                  disabled={isLoading || !newPassword || !confirmPwd}
                  android_ripple={{ color: COLORS.overlay.ripple }}
                  style={{ width: '100%' }}>
                  <LinearGradient
                    colors={isLoading || !newPassword || !confirmPwd ? [COLORS.brand.primaryDeep, COLORS.brand.pinkDark] : [COLORS.brand.primary, COLORS.brand.pink]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.primaryBtn}>
                    {isLoading
                      ? <View style={styles.loadingRow}><Spinner /><Text style={styles.primaryBtnText}>Updating...</Text></View>
                      : <Text style={styles.primaryBtnText}>Update Password</Text>}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Inline error box ─────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <View style={errorStyles.wrap}>
      <Ionicons name="alert-circle" size={16} color={COLORS.accent.redSoft} style={{ marginTop: 1 }} />
      <Text style={errorStyles.text}>{message}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.black,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.bg.elevated,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  fieldWrap: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.text.tertiary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 4,
  },
  inputRowFocused: {
    borderColor: COLORS.brand.primaryDark,
  },
  inputIcon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 15,
  },
  eyeBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  resendWrap: {
    marginTop: 4,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
  resendLink: {
    color: COLORS.brand.violetMuted,
    fontWeight: '600',
  },
});

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border.default,
  },
  dotActive: {
    backgroundColor: COLORS.brand.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: COLORS.brand.primaryDark,
  },
});

const successStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  backBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backBtnText: {
    color: COLORS.bg.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

const errorStyles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.accent.redDark,
    borderWidth: 1,
    borderColor: COLORS.accent.redBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: {
    flex: 1,
    color: COLORS.accent.redSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});

const spinnerStyles = StyleSheet.create({
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: COLORS.overlay.spinnerBorder,
    borderTopColor: COLORS.text.primary,
  },
});

