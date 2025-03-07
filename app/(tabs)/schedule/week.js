import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useBadges } from '../../context/BadgeContext';
import { useSchoolTimes } from '../../context/SchoolTimeContext';
import { useStage } from '../../context/StageContext';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign,
  ANIMATION
} from '../../theme';

const STORAGE_KEY = 'weeklyScheduleData';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function WeekView() {
  const router = useRouter();
  const { stage } = useLocalSearchParams();
  const { stageDetails } = useStage();
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
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Get stage-specific design
  const stageDesign = getStageDesign(stage || 'high');
  
  const updateWeekProgress = useCallback(() => {
    const now = new Date();
    
    // Check if date is within academic year
    if (!isWithinAcademicYear(stage, now)) {
      setWeekProgress({
        progress: 0,
        status: 'Outside of academic year'
      });
      
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: ANIMATION.medium,
        useNativeDriver: false,
      }).start();
      
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
      
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: ANIMATION.medium,
        useNativeDriver: false,
      }).start();
      
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

    const boundedProgress = Math.min(100, progress);
    setWeekProgress({
      progress: boundedProgress,
      status
    });
    
    Animated.timing(progressAnimation, {
      toValue: boundedProgress,
      duration: ANIMATION.medium,
      useNativeDriver: false,
    }).start();
    
  }, [stage, isWithinAcademicYear, markDayComplete, weekCompletionAwarded, progressAnimation]);

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

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome5 name="arrow-left" size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Weekly Schedule</Text>
          <View style={[styles.stageBadge, { backgroundColor: stageDesign.primaryColor }]}>
            <Text style={styles.stageText}>{stageDetails?.name || stage}</Text>
          </View>
        </View>

        {/* Week Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Week Progress</Text>
            <Text style={styles.progressValue}>{Math.round(weekProgress.progress)}%</Text>
          </View>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: progressWidth, backgroundColor: stageDesign.progressBarColor }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{weekProgress.status}</Text>
        </View>

        {days.map((day) => (
          <View key={day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <View style={styles.dayTitleContainer}>
                <FontAwesome5 
                  name="calendar-day" 
                  size={16} 
                  color={stageDesign.primaryColor}
                  style={styles.dayIcon} 
                />
                <Text style={styles.dayTitle}>{day}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  editingDay === day && styles.activeEditButton,
                  { backgroundColor: editingDay === day ? stageDesign.primaryColor : 'transparent' }
                ]}
                onPress={() => setEditingDay(editingDay === day ? null : day)}
              >
                <Text style={[
                  styles.editButtonText,
                  { color: editingDay === day ? COLORS.text.inverse : stageDesign.primaryColor }
                ]}>
                  {editingDay === day ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingDay === day && (
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 8:30 AM"
                    value={newItem.time}
                    onChangeText={(text) => setNewItem({ ...newItem, time: text })}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subject</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Mathematics"
                    value={newItem.subject}
                    onChangeText={(text) => setNewItem({ ...newItem, subject: text })}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Room 101"
                    value={newItem.location}
                    onChangeText={(text) => setNewItem({ ...newItem, location: text })}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: stageDesign.primaryColor }]}
                  onPress={() => addScheduleItem(day)}
                >
                  <FontAwesome5 name="plus" size={14} color={COLORS.text.inverse} style={styles.addButtonIcon} />
                  <Text style={styles.addButtonText}>Add Class</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.scheduleContainer}>
              {(schedule[day.toLowerCase()] || []).length === 0 ? (
                <View style={styles.emptyDayContainer}>
                  <Text style={styles.emptyDayText}>No classes scheduled</Text>
                  <TouchableOpacity 
                    onPress={() => setEditingDay(day)}
                    style={styles.addEmptyButton}
                  >
                    <Text style={[styles.addEmptyText, { color: stageDesign.primaryColor }]}>Add Class</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                (schedule[day.toLowerCase()] || []).map((item, index) => (
                  <View key={index} style={styles.classBlock}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{item.time}</Text>
                      <View style={[styles.timeLine, { backgroundColor: stageDesign.primaryColor }]} />
                    </View>
                    <View style={[
                      styles.classInfo, 
                      { borderLeftColor: stageDesign.primaryColor }
                    ]}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                      <View style={styles.locationContainer}>
                        <FontAwesome5 
                          name="map-marker-alt" 
                          size={12} 
                          color={COLORS.text.tertiary}
                          style={styles.locationIcon} 
                        />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  stageBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
  },
  stageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  progressCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.circle,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.circle,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  dayContainer: {
    marginBottom: SPACING.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayIcon: {
    marginRight: SPACING.xs,
  },
  dayTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  editButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  activeEditButton: {
    borderColor: 'transparent',
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  form: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  formGroup: {
    marginBottom: SPACING.sm,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  input: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonIcon: {
    marginRight: SPACING.xs,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  scheduleContainer: {
    paddingLeft: SPACING.sm,
  },
  emptyDayContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  addEmptyButton: {
    padding: SPACING.xs,
  },
  addEmptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  classBlock: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timeContainer: {
    width: 65,
    alignItems: 'center',
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  timeLine: {
    width: 2,
    height: '85%',
    opacity: 0.5,
  },
  classInfo: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    ...SHADOWS.xs,
  },
  subjectText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: SPACING.xs / 2,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
  },
});