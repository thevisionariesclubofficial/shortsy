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

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={iconStyles.arrowTop} />
      <View style={iconStyles.arrowBottom} />
    </View>
  );
}

function MailIcon({ color = '#737373', size = 20 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.8,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: color,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: 1.5,
          backgroundColor: color,
          top: size * 0.2,
          transform: [{ rotate: '30deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: 1.5,
          backgroundColor: color,
          top: size * 0.2,
          transform: [{ rotate: '-30deg' }],
        }}
      />
    </View>
  );
}

function CheckCircleIcon() {
  return (
    <View style={checkStyles.outerRing}>
      {/* checkmark — long arm */}
      <View style={checkStyles.armLong} />
      {/* checkmark — short arm */}
      <View style={checkStyles.armShort} />
    </View>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
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
    <Animated.View style={[spinnerStyles.ring, { transform: [{ rotate }] }]} />
  );
}

// ─── Success view ─────────────────────────────────────────────────────────────
function SuccessView({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <View style={successStyles.root}>
      {/* Green circle with check */}
      <View style={successStyles.iconWrap}>
        <CheckCircleIcon />
      </View>

      <View style={successStyles.textBlock}>
        <Text style={successStyles.title}>Check Your Email</Text>
        <Text style={successStyles.body}>
          We've sent a password reset link to{' '}
          <Text style={successStyles.emailHighlight}>{email}</Text>
        </Text>
      </View>

      <Text style={successStyles.hint}>
        Didn't receive the email? Check your spam folder or try again.
      </Text>

      {/* Back to Login button */}
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
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#1a0533', '#000000', '#1a0519']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <SuccessView email={email} onBack={onBack} />
      </View>
    );
  }

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header row — back button + title */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
          </View>

          {/* Centre content */}
          <View style={styles.centre}>
            {/* Mail circle */}
            <View style={styles.mailCircle}>
              <MailIcon color="#a855f7" size={32} />
            </View>

            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password
            </Text>

            {/* Email field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
                <View style={styles.inputIcon}>
                  <MailIcon color="#737373" size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#737373"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>
            </View>

            {/* Send Reset Link button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading || !email}
              android_ripple={{ color: '#ffffff20' }}>
              <LinearGradient
                colors={
                  isLoading || !email
                    ? ['#4a1f6e', '#7c2453']
                    : ['#9333ea', '#ec4899']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendBtn}>
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <Spinner />
                    <Text style={styles.sendBtnText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.sendBtnText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Back to Login text link */}
            <TouchableOpacity onPress={onBack} style={styles.backLinkWrap}>
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    marginBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  mailCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2d1a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  fieldWrap: {
    width: '100%',
    gap: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 4,
  },
  inputRowFocused: {
    borderColor: '#7c3aed',
  },
  inputIcon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    paddingRight: 12,
  },
  sendBtn: {
    width: '100%',
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
  sendBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  backLinkWrap: {
    marginTop: 4,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#737373',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#052e16',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#525252',
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

const spinnerStyles = StyleSheet.create({
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#ffffff40',
    borderTopColor: '#ffffff',
  },
});

const checkStyles = StyleSheet.create({
  outerRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  armLong: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    bottom: 13,
    right: 5,
    transform: [{ rotate: '-50deg' }],
  },
  armShort: {
    position: 'absolute',
    width: 10,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    bottom: 11,
    left: 6,
    transform: [{ rotate: '45deg' }],
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
    left: 3,
    top: 5,
    transform: [{ rotate: '-45deg' }],
  },
  arrowBottom: {
    position: 'absolute',
    width: 8,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    left: 3,
    bottom: 5,
    transform: [{ rotate: '45deg' }],
  },
});
