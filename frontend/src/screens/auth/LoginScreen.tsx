import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login } = useAuth();

  // Main entrance animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  const titleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Background floating animations
  const blob1X = useRef(new Animated.Value(0)).current;
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2X = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;

  // Input focus animations
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;

  // Loading animation
  const loadingRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.stagger(120, [
      Animated.parallel([
        Animated.spring(logoAnim, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(formAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating background blobs
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1X, {
            toValue: 35,
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(blob1X, {
            toValue: 0,
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(blob1Y, {
            toValue: -30,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(blob1Y, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob2X, {
            toValue: -30,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(blob2X, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(blob2Y, {
            toValue: 35,
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(blob2Y, {
            toValue: 0,
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    return () => {
      logoAnim.stopAnimation();
      logoScale.stopAnimation();
      titleAnim.stopAnimation();
      formAnim.stopAnimation();
      buttonAnim.stopAnimation();
      blob1X.stopAnimation();
      blob1Y.stopAnimation();
      blob2X.stopAnimation();
      blob2Y.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadingRotation.stopAnimation();
      loadingRotation.setValue(0);
      return;
    }

    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [isLoading]);

  const handleFocus = (
    animation: Animated.Value,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(true);

    Animated.spring(animation, {
      toValue: 1,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (
    animation: Animated.Value,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: string
  ) => {
    setter(false);

    Animated.spring(animation, {
      toValue: value ? 1 : 0,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message ||
          'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const formTranslateY = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const emailBorderColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#5B5FEF'],
  });

  const passwordBorderColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#5B5FEF'],
  });

  const rotateLoading = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.backgroundBase} />

        <Animated.View
          style={[
            styles.blob,
            styles.blobOne,
            {
              transform: [
                { translateX: blob1X },
                { translateY: blob1Y },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blob,
            styles.blobTwo,
            {
              transform: [
                { translateX: blob2X },
                { translateY: blob2Y },
              ],
            },
          ]}
        />

        <View style={styles.smallCircleOne} />
        <View style={styles.smallCircleTwo} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoAnim,
                transform: [
                  { translateY: logoTranslateY },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <View style={styles.logoGlow}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="checkmark-done"
                  size={38}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleAnim,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.welcomeText}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Stay organized. Stay productive.
            </Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: formAnim,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email address</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: emailBorderColor,
                  },
                  emailFocused && styles.inputWrapperFocused,
                ]}
              >
                <View
                  style={[
                    styles.inputIcon,
                    emailFocused && styles.inputIconFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailFocused ? '#5B5FEF' : '#9CA3AF'}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#A1A1AA"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() =>
                    handleFocus(emailFocusAnim, setEmailFocused)
                  }
                  onBlur={() =>
                    handleBlur(
                      emailFocusAnim,
                      setEmailFocused,
                      email
                    )
                  }
                />
              </Animated.View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: passwordBorderColor,
                  },
                  passwordFocused && styles.inputWrapperFocused,
                ]}
              >
                <View
                  style={[
                    styles.inputIcon,
                    passwordFocused && styles.inputIconFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordFocused ? '#5B5FEF' : '#9CA3AF'}
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#A1A1AA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() =>
                    handleFocus(
                      passwordFocusAnim,
                      setPasswordFocused
                    )
                  }
                  onBlur={() =>
                    handleBlur(
                      passwordFocusAnim,
                      setPasswordFocused,
                      password
                    )
                  }
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword((previous) => !previous)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-outline'
                        : 'eye-off-outline'
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotButton}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [{ translateY: buttonTranslateY }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonLoading,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={styles.loadingContent}>
                    <Animated.View
                      style={{
                        transform: [{ rotate: rotateLoading }],
                      }}
                    >
                      <Ionicons
                        name="sync-outline"
                        size={21}
                        color="#FFFFFF"
                      />
                    </Animated.View>

                    <Text style={styles.loginButtonText}>
                      Signing in...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loginContent}>
                    <Text style={styles.loginButtonText}>
                      Sign In
                    </Text>

                    <View style={styles.arrowCircle}>
                      <Ionicons
                        name="arrow-forward"
                        size={17}
                        color="#5B5FEF"
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Sign Up */}
          <Animated.View
            style={[
              styles.signupContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: buttonTranslateY }],
              },
            ]}
          >
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: buttonAnim,
              },
            ]}
          >
            <View style={styles.footerLine} />

            <View style={styles.secureContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#A1A1AA"
              />

              <Text style={styles.secureText}>
                Your information is secure
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F7FB',
  },

  blob: {
    position: 'absolute',
    borderRadius: 999,
  },

  blobOne: {
    width: 280,
    height: 280,
    backgroundColor: '#E6E5FF',
    top: -110,
    right: -100,
    opacity: 0.75,
  },

  blobTwo: {
    width: 240,
    height: 240,
    backgroundColor: '#E0F2FE',
    bottom: -80,
    left: -100,
    opacity: 0.8,
  },

  smallCircleOne: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE9FE',
    top: height * 0.32,
    right: -35,
    opacity: 0.55,
  },

  smallCircleTwo: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    bottom: height * 0.22,
    right: width * 0.15,
    opacity: 0.6,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 35,
  },

  /* Logo */

  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoGlow: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: '#E8E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B5FEF',
    shadowOpacity: 0.15,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#5B5FEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B5FEF',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  /* Title */

  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  welcomeText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },

  /* Card */

  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 25,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EEEEF2',

    shadowColor: '#18181B',
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 6,
  },

  inputGroup: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F3F46',
    marginBottom: 8,
    marginLeft: 2,
  },

  inputWrapper: {
    height: 57,
    borderRadius: 15,
    backgroundColor: '#FAFAFC',
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  inputWrapperFocused: {
    backgroundColor: '#FBFBFF',
    shadowColor: '#5B5FEF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  inputIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F5',
    marginRight: 8,
  },

  inputIconFocused: {
    backgroundColor: '#EEEEFF',
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#18181B',
    fontWeight: '500',
  },

  eyeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 20,
  },

  forgotText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#5B5FEF',
  },

  /* Login */

  loginButton: {
    height: 58,
    borderRadius: 17,
    backgroundColor: '#5B5FEF',
    justifyContent: 'center',
    paddingHorizontal: 7,

    shadowColor: '#5B5FEF',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 6,
  },

  loginButtonLoading: {
    opacity: 0.75,
  },

  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  arrowCircle: {
    position: 'absolute',
    right: 5,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  /* Sign Up */

  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  signupText: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
  },

  signupLink: {
    fontSize: 13,
    color: '#5B5FEF',
    fontWeight: '800',
  },

  /* Footer */

  footer: {
    alignItems: 'center',
    marginTop: 25,
  },

  footerLine: {
    width: 45,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4D4D8',
    marginBottom: 12,
  },

  secureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  secureText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
  },
});

export default LoginScreen;

