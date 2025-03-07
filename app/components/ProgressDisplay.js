import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { timeToMinutes, formatTime } from "../utils/timeUtils";
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  ANIMATION,
  getStageDesign
} from '../theme';

const ProgressDisplay = ({ stage, schoolTimes }) => {
  const [progress, setProgress] = useState(0);
  const [timeStatus, setTimeStatus] = useState('');
  const [displayMode, setDisplayMode] = useState('progress');
  const progressAnimation = useState(new Animated.Value(0))[0];
  
  // Get design tokens for current stage
  const stageDesign = getStageDesign(stage);

  useEffect(() => {
    // Reset when stage changes
    setProgress(0);
    setTimeStatus('');
    progressAnimation.setValue(0);
    
    // Update timer function
    const updateTimer = () => {
      const stageTimes = schoolTimes[stage];
      if (!stageTimes?.startTime || !stageTimes?.endTime) {
        setProgress(0);
        setTimeStatus('Please set school hours in Settings');
        return;
      }
      
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = timeToMinutes(stageTimes.startTime);
      const endTime = timeToMinutes(stageTimes.endTime);
      
      if (currentTime < startTime) {
        setProgress(0);
        setTimeStatus(`Starts in ${formatTime((startTime - currentTime) * 60)}`);
      } else if (currentTime > endTime) {
        setProgress(100);
        setTimeStatus('School day has ended');
        
        Animated.timing(progressAnimation, {
          toValue: 100,
          duration: ANIMATION.medium,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      } else {
        const totalDuration = endTime - startTime;
        const elapsed = currentTime - startTime;
        const currentProgress = (elapsed / totalDuration) * 100;
        const boundedProgress = Math.max(0, Math.min(100, currentProgress));
        setProgress(boundedProgress);
        setTimeStatus(`${formatTime((endTime - currentTime) * 60)} remaining`);
        
        Animated.timing(progressAnimation, {
          toValue: boundedProgress,
          duration: ANIMATION.medium,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    };
    
    // Run initial update
    updateTimer();
    
    // Set interval
    const intervalId = setInterval(updateTimer, 60000); // Update every minute to reduce battery impact
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [stage, schoolTimes, progressAnimation]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>School Day Progress</Text>
        {stageTimes && <Text style={styles.subtitle}>{stageTimes?.startTime} - {stageTimes?.endTime}</Text>}
      </View>
      
      <View style={styles.timerSection}>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            displayMode === 'progress' && styles.activeToggle,
            { borderTopLeftRadius: BORDER_RADIUS.md, borderBottomLeftRadius: BORDER_RADIUS.md }
          ]}
          onPress={() => setDisplayMode('progress')}
        >
          <FontAwesome5 
            name="chart-pie" 
            size={14} 
            color={displayMode === 'progress' ? COLORS.text.inverse : COLORS.text.secondary} 
            style={styles.buttonIcon}
          />
          <Text style={[
            styles.toggleButtonText,
            displayMode === 'progress' && styles.activeToggleText
          ]}>Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            displayMode === 'countdown' && styles.activeToggle,
            { borderTopRightRadius: BORDER_RADIUS.md, borderBottomRightRadius: BORDER_RADIUS.md }
          ]}
          onPress={() => setDisplayMode('countdown')}
        >
          <FontAwesome5 
            name="clock" 
            size={14} 
            color={displayMode === 'countdown' ? COLORS.text.inverse : COLORS.text.secondary} 
            style={styles.buttonIcon}
          />
          <Text style={[
            styles.toggleButtonText,
            displayMode === 'countdown' && styles.activeToggleText
          ]}>Timer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {displayMode === 'progress' ? (
          <>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: progressWidth, backgroundColor: stageDesign.progressBarColor }
              ]} 
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>
                {!schoolTimes[stage]?.startTime 
                  ? 'Set school hours'
                  : `${Math.round(progress)}% complete`
                }
              </Text>
              <View style={styles.statusContainer}>
                <FontAwesome5 
                  name={progress >= 100 ? "check-circle" : "clock"} 
                  size={14} 
                  color={progress >= 100 ? COLORS.success : COLORS.text.secondary} 
                  style={styles.statusIcon}
                />
                <Text style={styles.progressStatus}>
                  {progress >= 100 ? 'Complete' : timeStatus}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.countdownContainer}>
            <FontAwesome5 
              name={progress >= 100 ? "check-circle" : "hourglass-half"} 
              size={24} 
              color={progress >= 100 ? COLORS.success : stageDesign.primaryColor} 
              style={styles.countdownIcon}
            />
            <Text style={[
              styles.countdownText,
              { color: progress >= 100 ? COLORS.success : COLORS.text.primary }
            ]}>
              {timeStatus}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Helper component to get stage times
const stageTimes = (schoolTimes, stage) => {
  const times = schoolTimes[stage];
  return times?.startTime && times?.endTime ? times : null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.md
  },
  titleContainer: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  activeToggle: {
    backgroundColor: COLORS.primary.main,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  toggleButtonText: {
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  activeToggleText: {
    color: COLORS.text.inverse,
  },
  progressContainer: {
    height: 80,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
  },
  progressInfo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: SPACING.xs,
  },
  progressStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  countdownContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  countdownIcon: {
    marginRight: SPACING.sm,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  }
});

export default ProgressDisplay;