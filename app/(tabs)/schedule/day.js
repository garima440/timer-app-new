import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SCHOOL_TIMES_KEY,  
  timeToMinutes, 
  timeToSeconds, 
  validateTime,
  formatTime
} from '../../utils/timeUtils';

const STORAGE_KEY = 'scheduleData';

export default function DayView() {
  const { stage } = useLocalSearchParams();
  const [schedule, setSchedule] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayMode, setDisplayMode] = useState('progress');
  const [progress, setProgress] = useState(0);
  const [timeStatus, setTimeStatus] = useState('');
  const isMounted = useRef(true);
  const [newItem, setNewItem] = useState({
    time: '',
    subject: '',
    location: ''
  });
  const [schoolTimes, setSchoolTimes] = useState({
    elementary: { startTime: '', endTime: '' },
    middle: { startTime: '', endTime: '' },
    high: { startTime: '', endTime: '' },
    college: { startTime: '', endTime: '' }
  });

  const loadSchedule = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSchedule(parsedData[stage] || []);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const saveSchedule = async (newSchedule) => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData = savedData ? JSON.parse(savedData) : {};
      parsedData[stage] = newSchedule;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const addScheduleItem = () => {
    if (!newItem.time || !newItem.subject || !newItem.location) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (!validateTime(newItem.time)) {
      Alert.alert('Invalid Time Format', 'Please use format: HH:MM AM/PM (e.g., 8:30 AM)');
      return;
    }
  
    const updatedSchedule = [...schedule, newItem].sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  
    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setNewItem({ time: '', subject: '', location: '' });
  };

  // Rest of your existing code...
  // Update the callback functions to reduce unnecessary logs
const updateTimeStatus = useCallback(() => {
  const stageTimes = schoolTimes[stage];
  
  if (!stageTimes?.startTime || !stageTimes?.endTime) {
    setTimeStatus('Please set school hours in Settings');
    return;
  }

  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const startSeconds = timeToSeconds(stageTimes.startTime);
  const endSeconds = timeToSeconds(stageTimes.endTime);

  if (currentSeconds < startSeconds) {
    const secondsUntilStart = startSeconds - currentSeconds;
    setTimeStatus(`School starts in ${formatTime(secondsUntilStart)}`);
  } else if (currentSeconds > endSeconds) {
    setTimeStatus('School day has ended');
  } else {
    const secondsUntilEnd = endSeconds - currentSeconds;
    setTimeStatus(`${formatTime(secondsUntilEnd)} until school ends`);
  }
}, [schoolTimes, stage]);

const updateProgress = useCallback(() => {
  const stageTimes = schoolTimes[stage];
  
  if (!stageTimes?.startTime || !stageTimes?.endTime) {
    setProgress(0);
    return;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = timeToMinutes(stageTimes.startTime);
  const endTime = timeToMinutes(stageTimes.endTime);
  
  if (currentTime < startTime) {
    setProgress(0);
  } else if (currentTime > endTime) {
    setProgress(100);
  } else {
    const totalDuration = endTime - startTime;
    const elapsed = currentTime - startTime;
    const currentProgress = (elapsed / totalDuration) * 100;
    setProgress(Math.max(0, Math.min(100, currentProgress)));
  }
}, [schoolTimes, stage]);

  const loadSchoolTimes = async () => {
    try {
      const savedTimes = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      console.log('Loading school times:', savedTimes);
      if (savedTimes) {
        const parsedTimes = JSON.parse(savedTimes);
        setSchoolTimes(parsedTimes);
      }
    } catch (error) {
      console.error('Error loading school times:', error);
    }
  };

  // Update the useEffect for loading data
  useEffect(() => {
    loadSchedule();
    loadSchoolTimes();
    return () => {
      isMounted.current = false;
    };
  }, [stage]);

  // Update timer/progress when school times change
  useEffect(() => {
    if (!schoolTimes[stage]) return;
  
    let intervalId;
    
    const updateTime = () => {
      if (!isMounted.current) return;
      updateProgress();
      updateTimeStatus();
    };
  
    // Initial update
    updateTime();
  
    // Set interval for updates
    intervalId = setInterval(updateTime, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [schoolTimes, stage, updateProgress, updateTimeStatus]);
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>

      {/* Progress Bar OR Countdown */}
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
                {progress === 0 && !schoolTimes[stage]?.startTime 
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
      </View>

      {/* Add Schedule Item Form */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setIsEditing(!isEditing)}
      >
        <Text style={styles.editButtonText}>
          {isEditing ? 'Done' : 'Add Schedule Items'}
        </Text>
      </TouchableOpacity>

      {isEditing && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Time (e.g., 8:30 AM)"
            value={newItem.time}
            onChangeText={(text) => setNewItem({ ...newItem, time: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Subject"
            value={newItem.subject}
            onChangeText={(text) => setNewItem({ ...newItem, subject: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newItem.location}
            onChangeText={(text) => setNewItem({ ...newItem, location: text })}
          />
          <TouchableOpacity style={styles.addButton} onPress={addScheduleItem}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timeline View */}
      <View style={styles.timeline}>
        {schedule.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{item.time}</Text>
              <View style={styles.timelineLine} />
            </View>
            
            <View style={styles.contentCard}>
              <Text style={styles.subjectText}>{item.subject}</Text>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  form: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  timeline: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    height: 60,
    alignItems: 'center',
  },
  timeColumn: {
    width: 65,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: '140%',
    backgroundColor: '#e5e7eb',
    right: -1,
    top: -10,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    marginLeft: 12,
    height: 50,
    justifyContent: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  timesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  displayToggle: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
    padding: 4,
  },
  toggleText: {
    fontSize: 16,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 32,
    color: '#000',
    fontSize: 13,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s ease',
  },

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
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
});