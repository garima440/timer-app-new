import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Easing,
  Dimensions
} from 'react-native';
import { useBadges } from '../context/BadgeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign,
  ANIMATION
} from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BadgeNotification() {
  const { recentlyEarnedBadge, clearRecentBadge } = useBadges();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (recentlyEarnedBadge) {
      // Start animations
      Animated.parallel([
        // Slide in notification
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION.medium,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        }),
        // Fade in
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION.medium,
          useNativeDriver: true
        }),
        // Scale up
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION.medium,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true
        })
      ]).start();
      
      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        dismissNotification();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [recentlyEarnedBadge]);
  
  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: ANIMATION.medium,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: ANIMATION.medium,
        useNativeDriver: true
      })
    ]).start(() => {
      clearRecentBadge();
    });
  };
  
  if (!recentlyEarnedBadge) return null;
  
  // Determine notification color based on badge type
  const getNotificationColor = () => {
    if (!recentlyEarnedBadge) return COLORS.primary.main;
    
    switch(recentlyEarnedBadge.type) {
      case 'milestone': return COLORS.success;
      case 'streak': return COLORS.warning;
      case 'habit': return COLORS.education.high;
      case 'activity': return COLORS.education.college;
      default: return COLORS.primary.main;
    }
  };
  
  const notificationColor = getNotificationColor();
  
  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
          backgroundColor: notificationColor
        }
      ]}
    >
      <View style={styles.leftAccent} />
      
      <View style={styles.badge}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{recentlyEarnedBadge.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Badge Earned!</Text>
          <Text style={styles.badgeName}>{recentlyEarnedBadge.name}</Text>
          <Text style={styles.description}>{recentlyEarnedBadge.description}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={dismissNotification}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <FontAwesome5 name="times" size={14} color={COLORS.text.inverse} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: SPACING.md,
    right: SPACING.md,
    maxWidth: SCREEN_WIDTH - (SPACING.md * 2),
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.lg,
    zIndex: 1000
  },
  leftAccent: {
    width: 8,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.text.inverse,
    opacity: 0.9,
    marginBottom: SPACING.xs / 2,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs / 2,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  closeButton: {
    height: 24,
    width: 24,
    borderRadius: BORDER_RADIUS.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginLeft: SPACING.sm,
  }
});