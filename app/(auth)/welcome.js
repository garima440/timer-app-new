// app/(public)/welcome.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  // Animations
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const textAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations for elements to appear
    Animated.sequence([
      // Background animation first
      Animated.timing(backgroundAnimation, {
        toValue: 1,
        duration: ANIMATION.slow || 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      // Logo animation
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: ANIMATION.medium || 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true
      }),
      // Text animation after logo
      Animated.timing(textAnimation, {
        toValue: 1,
        duration: ANIMATION.medium || 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      // Button animation last
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: ANIMATION.medium || 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleEnterApp = () => {
    // Navigate to home
    router.replace('/(tabs)/home');
  };

  // Animation transforms
  const backgroundTransform = {
    opacity: backgroundAnimation,
  };

  const logoTransform = {
    opacity: logoAnimation,
    transform: [
      { translateY: logoAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 0]
        })
      },
      { scale: logoAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }
    ]
  };

  const textTransform = {
    opacity: textAnimation,
    transform: [
      { translateY: textAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }
    ]
  };

  const buttonTransform = {
    opacity: buttonAnimation,
    transform: [
      { scale: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1]
        })
      }
    ]
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#303F9F" />
      
      {/* Background Graphic Elements */}
      <Animated.View style={[styles.backgroundGraphic, backgroundTransform]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </Animated.View>

      <View style={styles.container}>
        {/* Header/Logo Section */}
        <Animated.View style={[styles.header, logoTransform]}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="graduation-cap" size={60} solid color={COLORS.background.primary} />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, textTransform]}>
          <Text style={styles.title}>School Timeline</Text>
          <Text style={styles.subtitle}>Track your educational journey from start to finish</Text>
          <Text style={styles.description}>
            Document your achievements, set goals, and visualize your educational progress all in one place.
          </Text>
        </Animated.View>

        {/* Button Section */}
        <Animated.View style={[styles.buttonContainer, buttonTransform]}>
          <TouchableOpacity 
            style={styles.enterButton} 
            onPress={handleEnterApp}
            activeOpacity={0.8}
          >
            <Text style={styles.enterButtonText}>Get Started</Text>
            <FontAwesome5 
              name="arrow-right" 
              size={16} 
              color={COLORS.text.inverse} 
              style={styles.buttonIcon} 
            />
          </TouchableOpacity>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <FontAwesome5 name="calendar-check" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Track Milestones</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="chart-line" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Visualize Progress</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="medal" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Record Achievements</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#303F9F', // Rich indigo blue that's popular in educational apps
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  backgroundGraphic: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: COLORS.background.secondary,
    top: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.2,
    opacity: 0.5,
  },
  circle2: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: COLORS.neutral[200],
    bottom: SCREEN_HEIGHT * 0.1,
    right: -SCREEN_WIDTH * 0.3,
    opacity: 0.6,
  },
  circle3: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: COLORS.text.secondary,
    top: SCREEN_HEIGHT * 0.4,
    left: -SCREEN_WIDTH * 0.2,
    opacity: 0.3,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: '#7986CB', // Lighter indigo that complements the background
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  textContent: {
    alignItems: 'center',
    marginTop: -SPACING.xxl, // Pull this section up closer to the logo
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '800',
    color: COLORS.background.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.background.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: SPACING.xxxl || 64,
  },
  enterButton: {
    flexDirection: 'row',
    backgroundColor: '#5C6BC0', // Indigo color that complements the background
    height: 60,
    borderRadius: BORDER_RADIUS.lg || BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    marginHorizontal: SPACING.lg,
  },
  buttonIcon: {
    marginLeft: SPACING.xs,
  },
  enterButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  featuresContainer: {
    marginTop: SPACING.xl || SPACING.lg,
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    width: '100%',
    justifyContent: 'center',
  },
  featureText: {
    marginLeft: SPACING.xs,
    color: COLORS.background.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    paddingRight: SPACING.xs,
  },
});