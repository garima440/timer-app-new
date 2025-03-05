import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useBadges } from '../context/BadgeContext';

export default function BadgeNotification() {
  const { recentlyEarnedBadge, clearRecentBadge } = useBadges();
  const slideAnim = React.useRef(new Animated.Value(-200)).current;
  
  useEffect(() => {
    if (recentlyEarnedBadge) {
      // Slide in notification
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start();
      
      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        dismissNotification();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [recentlyEarnedBadge]);
  
  const dismissNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      clearRecentBadge();
    });
  };
  
  if (!recentlyEarnedBadge) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.badge}>
        <Text style={styles.icon}>{recentlyEarnedBadge.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{recentlyEarnedBadge.name}</Text>
          <Text style={styles.description}>{recentlyEarnedBadge.description}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={dismissNotification}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  icon: {
    fontSize: 32,
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  description: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9
  },
  closeButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  closeText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 20
  }
});