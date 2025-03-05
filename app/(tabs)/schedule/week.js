import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBadges } from '../../context/BadgeContext';
import { useSchoolTimes } from '../../context/SchoolTimeContext';

const STORAGE_KEY = 'weeklyScheduleData';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function WeekView() {
  const { stage } = useLocalSearchParams();
  const [schedule, setSchedule] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [newItem, setNewItem] = useState({
    time: '',
    subject: '',
    location: ''
  });
  const [weekProgress, setWeekProgress] = useState({
    progress: 0,
    status: ''
  });
  
  // Add badge integration
  const { markDayComplete, updateActivityProgress } = useBadges();
  const { isWithinAcademicYear } = useSchoolTimes();
  
  // Add state to track if week completion has been awarded
  const [weekCompletionAwarded, setWeekCompletionAwarded] = useState(false);

  const updateWeekProgress = useCallback(() => {
    const now = new Date();
    
    // Check if date is within academic year
    if (!isWithinAcademicYear(stage, now)) {
      setWeekProgress({
        progress: 0,
        status: 'Outside of academic year'
      });
      return;
    }
    
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // If it's weekend
    if (currentDay === 0 || currentDay === 6) {
      setWeekProgress({
        progress: 0,
        status: 'Weekend - School resumes Monday'
      });
      return;
    }

    // Calculate week progress
    const dayIndex = currentDay - 1; // Convert to 0-based index for weekdays
    const totalMinutesInSchoolDay = 480; // Assuming 8 hours school day
    const totalMinutesInWeek = totalMinutesInSchoolDay * 5;
    
    const minutesCompleted = (dayIndex * totalMinutesInSchoolDay) + Math.min(currentTime, totalMinutesInSchoolDay);
    const progress = (minutesCompleted / totalMinutesInWeek) * 100;

    let status;
    if (progress >= 100) {
      status = 'Week completed';
      
      // Only award badge once per week
      if (!weekCompletionAwarded) {
        markDayComplete('week');
        setWeekCompletionAwarded(true);
      }
    } else {
      const daysLeft = 5 - dayIndex;
      status = `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`;
      setWeekCompletionAwarded(false);
    }

    setWeekProgress({
      progress: Math.min(100, progress),
      status
    });
  }, [stage, isWithinAcademicYear, markDayComplete, weekCompletionAwarded]);

  useEffect(() => {
    loadSchedule();
  }, [stage]);

  useEffect(() => {
    updateWeekProgress();
    const interval = setInterval(updateWeekProgress, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateWeekProgress]);

  const loadSchedule = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSchedule(parsedData[stage] || {});
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

  const addScheduleItem = (day) => {
    if (!newItem.time || !newItem.subject || !newItem.location) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const daySchedule = schedule[day.toLowerCase()] || [];
    const updatedDaySchedule = [...daySchedule, newItem].sort((a, b) => {
      return new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time);
    });

    const updatedSchedule = {
      ...schedule,
      [day.toLowerCase()]: updatedDaySchedule
    };

    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setNewItem({ time: '', subject: '', location: '' });
    
    // Update schedule badge progress
    updateActivityProgress('schedule_item_added');
    
    // Check if all days now have at least one class scheduled
    const hasAllDaysScheduled = days.every(d => 
      (updatedSchedule[d.toLowerCase()] || []).length > 0
    );
    
    if (hasAllDaysScheduled) {
      // Update badge for having a complete weekly schedule
      updateActivityProgress('full_week_scheduled');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Schedule</Text>

      {/* Week Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${weekProgress.progress}%` }]} />
        <Text style={styles.progressText}>{weekProgress.status}</Text>
      </View>

      {days.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{day}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingDay(editingDay === day ? null : day)}
            >
              <Text style={styles.editButtonText}>
                {editingDay === day ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {editingDay === day && (
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
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => addScheduleItem(day)}
              >
                <Text style={styles.addButtonText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.scheduleContainer}>
            {(schedule[day.toLowerCase()] || []).map((item, index) => (
              <View key={index} style={styles.classBlock}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={styles.classInfo}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
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
    marginBottom: 16,
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
    fontSize: 13,
    color: '#000',
  },
  dayContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
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
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleContainer: {
    marginLeft: 8,
  },
  classBlock: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  timeText: {
    width: 65,
    fontSize: 12,
    color: '#4b5563',
  },
  classInfo: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});