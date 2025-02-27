import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { timeToMinutes, formatTime } from "../utils/timeUtils"
const ProgressDisplay = ({ stage, schoolTimes }) => {
  const [progress, setProgress] = useState(0);
  const [timeStatus, setTimeStatus] = useState('');
  const [displayMode, setDisplayMode] = useState('progress');

  useEffect(() => {
    // Reset when stage changes
    setProgress(0);
    setTimeStatus('');
    
    console.log(`ProgressDisplay: Stage changed to ${stage}`);
    
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
      
      console.log(`ProgressDisplay calculation for ${stage}:`, {
        current: currentTime,
        start: startTime,
        end: endTime
      });
      
      if (currentTime < startTime) {
        setProgress(0);
        setTimeStatus(`School starts in ${formatTime((startTime - currentTime) * 60)}`);
      } else if (currentTime > endTime) {
        setProgress(100);
        setTimeStatus('School day has ended');
      } else {
        const totalDuration = endTime - startTime;
        const elapsed = currentTime - startTime;
        const currentProgress = (elapsed / totalDuration) * 100;
        console.log(`ProgressDisplay: ${stage} progress = ${currentProgress.toFixed(2)}%`);
        setProgress(Math.max(0, Math.min(100, currentProgress)));
        setTimeStatus(`${formatTime((endTime - currentTime) * 60)} until school ends`);
      }
    };
    
    // Run initial update
    updateTimer();
    
    // Set interval
    const intervalId = setInterval(updateTimer, 1000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [stage, schoolTimes]);

  return (
    <View>
      <View style={styles.timerSection}>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            { backgroundColor: displayMode === 'progress' ? '#3b82f6' : '#4b5563' }
          ]}
          onPress={() => setDisplayMode('progress')}
        >
          <Text style={styles.toggleButtonText}>Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            { backgroundColor: displayMode === 'countdown' ? '#3b82f6' : '#4b5563' }
          ]}
          onPress={() => setDisplayMode('countdown')}
        >
          <Text style={styles.toggleButtonText}>Timer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {displayMode === 'progress' ? (
          <>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {!schoolTimes[stage]?.startTime 
                ? 'Please set school hours in Settings'
                : `${Math.round(progress)}% of school day complete`
              }
            </Text>
          </>
        ) : (
          <Text style={[styles.progressText, styles.countdownText]}>
            {timeStatus}
          </Text>
        )}
      </View>
      
      {/* Debug info - can be removed in production */}
      <Text style={styles.debugText}>
        Stage: {stage}, Progress: {progress.toFixed(1)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressContainer: {
    height: 40, 
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 32,
    color: '#000',
    fontSize: 13,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  }
});

export default ProgressDisplay;