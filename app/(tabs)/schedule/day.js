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
  const [newItem, setNewItem] = useState({
    time: '',
    subject: '',
    location: ''
  });
  const [progress, setProgress] = useState(0);
  const [timeStatus, setTimeStatus] = useState('');

  const timeToMinutes = useCallback((timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }, []);

  const updateTimeStatus = useCallback(() => {
    if (schedule.length === 0) {
      setTimeStatus('No schedule items');
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = timeToMinutes(schedule[0].time);
    const endTime = timeToMinutes(schedule[schedule.length - 1].time);

    if (currentTime < startTime) {
      const minutesUntilStart = startTime - currentTime;
      const hours = Math.floor(minutesUntilStart / 60);
      const minutes = minutesUntilStart % 60;
      setTimeStatus(`School starts in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`);
    } else if (currentTime > endTime) {
      setTimeStatus('School day has ended');
    } else {
      const minutesRemaining = endTime - currentTime;
      const hours = Math.floor(minutesRemaining / 60);
      const minutes = minutesRemaining % 60;
      setTimeStatus(`${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`);
    }
  }, [schedule, timeToMinutes]);

  const updateProgress = useCallback(() => {
    if (schedule.length === 0) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = timeToMinutes(schedule[0].time);
    const endTime = timeToMinutes(schedule[schedule.length - 1].time);
    
    if (currentTime < startTime) {
      setProgress(0);
    } else if (currentTime > endTime) {
      setProgress(100);
    } else {
      const currentProgress = ((currentTime - startTime) / (endTime - startTime)) * 100;
      setProgress(Math.max(0, Math.min(100, currentProgress)));
    }
  }, [schedule, timeToMinutes]);

  // Load schedule on mount
  useEffect(() => {
    loadSchedule();
  }, [stage]);

  // Setup timer for updates
  useEffect(() => {
    if (schedule.length === 0) return;
    
    const updateTime = () => {
      updateProgress();
      updateTimeStatus();
    };

    // Initial update
    updateTime();
    
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [schedule.length, updateProgress, updateTimeStatus]);

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

    const updatedSchedule = [...schedule, newItem].sort((a, b) => {
      return new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time);
    });

    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setNewItem({ time: '', subject: '', location: '' });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {timeStatus || `${Math.round(progress)}% of school day complete`}
        </Text>
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
  progressContainer: {
    height: 32,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
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
});