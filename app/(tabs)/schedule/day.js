import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'scheduleData';
const SCHOOL_TIMES_KEY = 'schoolTimes';

export default function DayView() {
  const { stage } = useLocalSearchParams();
  const [schedule, setSchedule] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [displayMode, setDisplayMode] = useState('progress'); 
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const [schoolTimes, setSchoolTimes] = useState({
    startTime: '',
    endTime: ''
  });

  const [newItem, setNewItem] = useState({
    time: '',
    subject: '',
    location: ''
  });
  const [progress, setProgress] = useState(0);
  const [timeStatus, setTimeStatus] = useState('');
  const [isSettingTimes, setIsSettingTimes] = useState(false);

  const timeToMinutes = useCallback((timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }, []);

  const timeToSeconds = useCallback((timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 3600 + minutes * 60;
  }, []);

  const updateTimeStatus = useCallback(() => {
    if (!schoolTimes.startTime || !schoolTimes.endTime) {
      setTimeStatus('Please set school start and end times');
      return;
    }
  
    const now = new Date();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const startSeconds = timeToSeconds(schoolTimes.startTime);
    const endSeconds = timeToSeconds(schoolTimes.endTime);
  
    if (currentSeconds < startSeconds) {
      const secondsUntilStart = startSeconds - currentSeconds;
      setSecondsRemaining(secondsUntilStart);
      const hours = Math.floor(secondsUntilStart / 3600);
      const minutes = Math.floor((secondsUntilStart % 3600) / 60);
      const seconds = secondsUntilStart % 60;
      setTimeStatus(`School starts in ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (currentSeconds > endSeconds) {
      setTimeStatus('School day has ended');
      setSecondsRemaining(0);
    } else {
      const secondsRemaining = endSeconds - currentSeconds;
      setSecondsRemaining(secondsRemaining);
      const hours = Math.floor(secondsRemaining / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      const seconds = secondsRemaining % 60;
      setTimeStatus(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} until school ends`);
    }
  }, [schoolTimes, timeToSeconds]);

  const updateProgress = useCallback(() => {
    if (!schoolTimes.startTime || !schoolTimes.endTime) {
      setProgress(0);
      return;
    }
  
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = timeToMinutes(schoolTimes.startTime);
    const endTime = timeToMinutes(schoolTimes.endTime);
    
    if (currentTime < startTime) {
      setProgress(0);
    } else if (currentTime > endTime) {
      setProgress(100);
    } else {
      const currentProgress = ((currentTime - startTime) / (endTime - startTime)) * 100;
      setProgress(Math.max(0, Math.min(100, currentProgress)));
    }
  }, [schoolTimes, timeToMinutes]);

  // Load schedule on mount
  useEffect(() => {
    loadSchedule();
    loadSchoolTimes();
  }, [stage]);

  // Setup timer for updates
  useEffect(() => {
    const updateTime = () => {
      updateProgress();
      updateTimeStatus();
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every minute
    return () => clearInterval(interval);
  }, [schoolTimes, updateProgress, updateTimeStatus]);

  const loadSchoolTimes = async () => {
    try {
      const savedTimes = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      if (savedTimes) {
        const parsedTimes = JSON.parse(savedTimes);
        setSchoolTimes(parsedTimes[stage] || { startTime: '', endTime: '' });
      }
    } catch (error) {
      console.error('Error loading school times:', error);
    }
  };

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

  const saveSchoolTimes = async (times) => {
    try {
      const savedTimes = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      const parsedTimes = savedTimes ? JSON.parse(savedTimes) : {};
      parsedTimes[stage] = times;
      await AsyncStorage.setItem(SCHOOL_TIMES_KEY, JSON.stringify(parsedTimes));
      setSchoolTimes(times);
      setIsSettingTimes(false);
    } catch (error) {
      console.error('Error saving school times:', error);
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

    const updatedSchedule = [...schedule, newItem].sort((a, b) => {
      return new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time);
    });

    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setNewItem({ time: '', subject: '', location: '' });
  };

  const validateTime = (timeStr) => {
    const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i;
    return timeRegex.test(timeStr);
  };


  const handleSaveSchoolTimes = () => {
    if (!validateTime(schoolTimes.startTime) || !validateTime(schoolTimes.endTime)) {
      Alert.alert('Invalid Time Format', 'Please use format: HH:MM AM/PM (e.g., 8:30 AM)');
      return;
    }

    const startMinutes = timeToMinutes(schoolTimes.startTime);
    const endMinutes = timeToMinutes(schoolTimes.endTime);

    if (endMinutes <= startMinutes) {
      Alert.alert('Invalid Times', 'End time must be after start time');
      return;
    }

    saveSchoolTimes(schoolTimes);
  };

  const TimerDisplay = () => {
    return (
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
    );
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>

      {/* School Times Setup */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setIsSettingTimes(!isSettingTimes)}
      >
        <Text style={styles.editButtonText}>
          {isSettingTimes ? 'Cancel' : 'Set School Hours'}
        </Text>
      </TouchableOpacity>

      {isSettingTimes && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="School Start Time (e.g., 8:30 AM)"
            value={schoolTimes.startTime}
            onChangeText={(text) => setSchoolTimes(prev => ({ ...prev, startTime: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="School End Time (e.g., 3:30 PM)"
            value={schoolTimes.endTime}
            onChangeText={(text) => setSchoolTimes(prev => ({ ...prev, endTime: text }))}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleSaveSchoolTimes}
          >
            <Text style={styles.addButtonText}>Save School Hours</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Bar OR Countdown */}
      <View>
      <TimerDisplay />
      <View style={styles.progressContainer}>
        {!schoolTimes.startTime || !schoolTimes.endTime ? (
          <Text style={styles.progressText}>
            Please set school hours
          </Text>
        ) : displayMode === 'progress' ? (
          <>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {`${Math.round(progress)}% of school day complete`}
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