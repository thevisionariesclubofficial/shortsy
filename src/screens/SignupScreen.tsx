import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// ─── Icon components ──────────────────────────────────────────────────────────

function FilmIcon() {
  return (
    <View style={iconStyles.filmOuter}>
      <View style={iconStyles.filmStripLeft}>
        {[0, 1, 2, 3].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
      <View style={{ flex: 1 }} />
      <View style={iconStyles.filmStripRight}>
        {[0, 1, 2, 3].map(i => <View key={i} style={iconStyles.filmHole} />)}
      </View>
    </View>
  );
}

function MailIcon() {
  return (
    <View style={iconStyles.mailOuter}>
      <View style={iconStyles.mailLine1} />
      <View style={iconStyles.mailLine2} />
      <View style={iconStyles.mailFlap} />
    </View>
  );
}

function UserIcon() {
  return (
    <View style={iconStyles.userWrap}>
      <View style={iconStyles.userHead} />
      <View style={iconStyles.userBody} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={iconStyles.lockWrap}>
      <View style={iconStyles.lockShackle} />
      <View style={iconStyles.lockBody} />
    </View>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <View style={iconStyles.eyeWrap}>
      <View style={iconStyles.eyeOval} />
      <View style={iconStyles.eyePupil} />
      {off && <View style={iconStyles.eyeSlash} />}
    </View>
  );
}

function ArrowLeftIcon() {
  return (
    <View style={iconStyles.arrowWrap}>
      <View style={iconStyles.arrowStem} />
      <View style={iconStyles.arrowTop} />
      <View style={iconStyles.arrowBottom} />
    </View>
  );
}

// ─── Google G SVG-alike (four coloured rectangles) ───────────────────────────
function GoogleIcon() {
  return (
    <View style={iconStyles.gWrap}>
      <View style={[iconStyles.gSlice, { backgroundColor: '#4285F4', top: 0, right: 10, width: 10, height: 10 }]} />
      <View style={[iconStyles.gSlice, { backgroundColor: '#34A853', bottom: 0, right: 10, width: 10, height: 10 }]} />
      <View style={[iconStyles.gSlice, { backgroundColor: '#FBBC05', bottom: 0, left: 10, width: 10, height: 10 }]} />
      <View style={[iconStyles.gSlice, { backgroundColor: '#EA4335', top: 0, left: 10, width: 10, height: 10 }]} />
      <View style={iconStyles.gCenter} />
    </View>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={checkboxStyles.box} activeOpacity={0.7}>
      {checked && (
        <>
          <View style={checkboxStyles.tick1} />
          <View style={checkboxStyles.tick2} />
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Spinning loader ─────────────────────────────────────────────────────────
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

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[spinnerStyles.ring, { transform: [{ rotate }] }]} />
  );
}

// ─── Field component ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  hint?: string;
  LeftIcon: React.ComponentType;
  RightSlot?: React.ReactNode;
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  hint,
  LeftIcon,
  RightSlot,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.row, focused && fieldStyles.rowFocused]}>
        <View style={fieldStyles.leftIcon}><LeftIcon /></View>
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {RightSlot}
      </View>
      {hint && <Text style={fieldStyles.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Main SignupScreen ────────────────────────────────────────────────────────
interface SignupScreenProps {
  onSignup: () => void;
  onLogin: () => void;
  onBack?: () => void;
}

export function SignupScreen({ onSignup, onLogin, onBack }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!acceptTerms) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignup();
    }, 1500);
  };

  const canSubmit = acceptTerms && !isLoading;

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

      {/* Back button */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeftIcon />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={['#9333ea', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}>
              <FilmIcon />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the indie cinema revolution</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <Field
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              LeftIcon={UserIcon}
            />

            {/* Email */}
            <Field
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              LeftIcon={MailIcon}
            />

            {/* Password */}
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              hint="At least 8 characters"
              LeftIcon={LockIcon}
              RightSlot={
                <TouchableOpacity
                  onPress={() => setShowPassword(p => !p)}
                  style={fieldStyles.rightIcon}>
                  <EyeIcon off={showPassword} />
                </TouchableOpacity>
              }
            />

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              LeftIcon={LockIcon}
            />

            {/* Terms */}
            <View style={styles.termsRow}>
              <Checkbox
                checked={acceptTerms}
                onPress={() => setAcceptTerms(p => !p)}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Create Account button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              android_ripple={{ color: '#ffffff20' }}>
              <LinearGradient
                colors={canSubmit ? ['#9333ea', '#ec4899'] : ['#4a1f6e', '#7c2453']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}>
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <Spinner />
                    <Text style={styles.submitText}>Creating account...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>Create Account</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <GoogleIcon />
              <Text style={styles.googleText}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 20,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#737373',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#a3a3a3',
    lineHeight: 20,
  },
  termsLink: {
    color: '#c084fc',
  },
  submitBtn: {
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
  submitText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#262626',
  },
  dividerText: {
    color: '#737373',
    fontSize: 13,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#171717',
  },
  googleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  loginPrompt: {
    color: '#737373',
    fontSize: 15,
  },
  loginLink: {
    color: '#c084fc',
    fontSize: 15,
    fontWeight: '600',
  },
});

const fieldStyles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 4,
  },
  rowFocused: {
    borderColor: '#7c3aed',
  },
  leftIcon: {
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
  rightIcon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
});

const checkboxStyles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#9333ea',
    backgroundColor: '#1a0533',
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick1: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: '#c084fc',
    borderRadius: 1.5,
    bottom: 3,
    left: 5,
    transform: [{ rotate: '-45deg' }],
  },
  tick2: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: '#c084fc',
    borderRadius: 1.5,
    bottom: 3,
    right: 4,
    transform: [{ rotate: '35deg' }],
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

// ─── Icon sub-styles ──────────────────────────────────────────────────────────
const iconStyles = StyleSheet.create({
  // Film
  filmOuter: {
    width: 40,
    height: 30,
    borderRadius: 4,
    borderWidth: 2.5,
    borderColor: '#fff',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  filmStripLeft: {
    width: 9,
    borderRightWidth: 2,
    borderRightColor: '#fff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmStripRight: {
    width: 9,
    borderLeftWidth: 2,
    borderLeftColor: '#fff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filmHole: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#fff',
  },

  // Mail
  mailOuter: {
    width: 20,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#737373',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailLine1: {
    position: 'absolute',
    width: 26,
    height: 1.5,
    backgroundColor: '#737373',
    top: 3,
    transform: [{ rotate: '30deg' }],
  },
  mailLine2: {
    position: 'absolute',
    width: 26,
    height: 1.5,
    backgroundColor: '#737373',
    top: 3,
    transform: [{ rotate: '-30deg' }],
  },
  mailFlap: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 7,
    backgroundColor: '#737373',
    opacity: 0,
  },

  // User
  userWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#737373',
    marginBottom: 1,
  },
  userBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#737373',
  },

  // Lock
  lockWrap: {
    width: 20,
    height: 22,
    alignItems: 'center',
  },
  lockShackle: {
    width: 12,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 2,
    borderColor: '#737373',
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  lockBody: {
    width: 18,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#737373',
  },

  // Eye
  eyeWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOval: {
    width: 18,
    height: 11,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#737373',
  },
  eyePupil: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#737373',
  },
  eyeSlash: {
    position: 'absolute',
    width: 22,
    height: 2,
    backgroundColor: '#737373',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  // Arrow left
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

  // Google G
  gWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  gSlice: {
    position: 'absolute',
    borderRadius: 2,
  },
  gCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    top: 6,
    left: 6,
  },
});
