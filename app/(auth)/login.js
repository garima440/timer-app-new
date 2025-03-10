// app/(auth)/login.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  ANIMATION
} from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  // Animations
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const footerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations for elements to appear
    Animated.sequence([
      // Logo animation
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: ANIMATION.medium,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true
      }),
      // Form animation after logo
      Animated.timing(formAnimation, {
        toValue: 1,
        duration: ANIMATION.medium,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      // Footer animation last
      Animated.timing(footerAnimation, {
        toValue: 1,
        duration: ANIMATION.medium,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleLogin = () => {
    // Add your login logic here
    // For now, just navigate to home
    router.replace('/(tabs)/home');
  };

  const handleSignUp = () => {
    // Add your sign up navigation or logic here
    console.log('Sign up pressed');
  };

  // Animation transforms
  const logoTransform = {
    opacity: logoAnimation,
    transform: [
      { translateY: logoAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0]
        })
      },
      { scale: logoAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }
    ]
  };

  const formTransform = {
    opacity: formAnimation,
    transform: [
      { translateY: formAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }
    ]
  };

  const footerTransform = {
    opacity: footerAnimation,
    transform: [
      { translateY: footerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0]
        })
      }
    ]
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* Header/Logo Section */}
          <Animated.View style={[styles.header, logoTransform]}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="graduation-cap" size={50} solid color={COLORS.primary.main} />
            </View>
            <Text style={styles.title}>School Timeline</Text>
            <Text style={styles.subtitle}>Track your educational journey</Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.form, formTransform]}>
            <View style={[
              styles.inputContainer, 
              emailFocused && styles.inputFocused
            ]}>
              <FontAwesome5 
                name="envelope" 
                size={16} 
                color={emailFocused ? COLORS.primary.main : COLORS.text.tertiary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholderTextColor={COLORS.text.tertiary}
              />
            </View>

            <View style={[
              styles.inputContainer, 
              passwordFocused && styles.inputFocused
            ]}>
              <FontAwesome5 
                name="lock" 
                size={16} 
                color={passwordFocused ? COLORS.primary.main : COLORS.text.tertiary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholderTextColor={COLORS.text.tertiary}
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => console.log('Forgot password')}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <FontAwesome5 
                name="sign-in-alt" 
                size={16} 
                color={COLORS.text.inverse} 
                style={styles.buttonIcon} 
              />
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
            
            {/* Social Login Options */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="google" size={18} color={COLORS.text.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="apple" size={18} color={COLORS.text.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="microsoft" size={18} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, footerTransform]}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
    backgroundColor: COLORS.background.secondary,
    marginBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  inputFocused: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  forgotPassword: {
    color: COLORS.primary.main,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary.main,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  loginButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dividerText: {
    marginHorizontal: SPACING.sm,
    color: COLORS.text.tertiary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...SHADOWS.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  signUpText: {
    color: COLORS.primary.main,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
});