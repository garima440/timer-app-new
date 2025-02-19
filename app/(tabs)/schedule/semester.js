import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const STORAGE_KEY = 'semesterData';

export default function SemesterView() {
  const { stage } = useLocalSearchParams();
  const [semesterData, setSemesterData] = useState({
    currentWeek: 1,
    totalWeeks: 16,
    importantDates: [],
    courses: []
  });
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingCourses, setIsEditingCourses] = useState(false);
  const [newDate, setNewDate] = useState({ event: '', week: '', status: 'upcoming' });
  const [newCourse, setNewCourse] = useState({ name: '', grade: '', status: '' });

  useEffect(() => {
    loadData();
  }, [stage]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSemesterData(parsedData[stage] || {
          currentWeek: 1,
          totalWeeks: 16,
          importantDates: [],
          courses: []
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (newData) => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData = savedData ? JSON.parse(savedData) : {};
      parsedData[stage] = newData;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addImportantDate = () => {
    if (!newDate.event || !newDate.week) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const updatedDates = [...semesterData.importantDates, newDate]
      .sort((a, b) => Number(a.week) - Number(b.week));

    const updatedData = {
      ...semesterData,
      importantDates: updatedDates
    };

    setSemesterData(updatedData);
    saveData(updatedData);
    setNewDate({ event: '', week: '', status: 'upcoming' });
  };

  const addCourse = () => {
    if (!newCourse.name) {
      Alert.alert('Missing Information', 'Please enter at least the course name');
      return;
    }

    const updatedCourses = [...semesterData.courses, newCourse];
    const updatedData = {
      ...semesterData,
      courses: updatedCourses
    };

    setSemesterData(updatedData);
    saveData(updatedData);
    setNewCourse({ name: '', grade: '', status: '' });
  };

  const updateWeek = (increment) => {
    const newWeek = Math.min(
      Math.max(1, semesterData.currentWeek + increment),
      semesterData.totalWeeks
    );
    
    const updatedData = {
      ...semesterData,
      currentWeek: newWeek
    };
    
    setSemesterData(updatedData);
    saveData(updatedData);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#ef4444';
    if (progress < 70) return '#eab308';
    return '#22c55e';
  };

  const progress = (semesterData.currentWeek / semesterData.totalWeeks) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Semester Overview</Text>

      {/* Progress Section */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Current Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%`, backgroundColor: getProgressColor(progress) }
            ]} 
          />
        </View>
        <View style={styles.weekControl}>
          <TouchableOpacity 
            style={styles.weekButton} 
            onPress={() => updateWeek(-1)}
          >
            <Text style={styles.weekButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.progressText}>
            Week {semesterData.currentWeek} of {semesterData.totalWeeks}
          </Text>
          <TouchableOpacity 
            style={styles.weekButton} 
            onPress={() => updateWeek(1)}
          >
            <Text style={styles.weekButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Important Dates */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Important Dates</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditingDates(!isEditingDates)}
          >
            <Text style={styles.editButtonText}>
              {isEditingDates ? 'Done' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingDates && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={newDate.event}
              onChangeText={(text) => setNewDate({ ...newDate, event: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Week Number"
              value={newDate.week}
              keyboardType="numeric"
              onChangeText={(text) => setNewDate({ ...newDate, week: text })}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addImportantDate}
            >
              <Text style={styles.addButtonText}>Add Date</Text>
            </TouchableOpacity>
          </View>
        )}

        {semesterData.importantDates.map((date, index) => (
          <View key={index} style={styles.dateCard}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateTitle}>{date.event}</Text>
              <Text style={styles.dateWeek}>Week {date.week}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: date.status === 'completed' ? '#dcfce7' : '#fef9c3' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: date.status === 'completed' ? '#166534' : '#854d0e' }
              ]}>
                {date.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Courses Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Courses Overview</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditingCourses(!isEditingCourses)}
          >
            <Text style={styles.editButtonText}>
              {isEditingCourses ? 'Done' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingCourses && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={newCourse.name}
              onChangeText={(text) => setNewCourse({ ...newCourse, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Grade (optional)"
              value={newCourse.grade}
              onChangeText={(text) => setNewCourse({ ...newCourse, grade: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Status (optional)"
              value={newCourse.status}
              onChangeText={(text) => setNewCourse({ ...newCourse, status: text })}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addCourse}
            >
              <Text style={styles.addButtonText}>Add Course</Text>
            </TouchableOpacity>
          </View>
        )}

        {semesterData.courses.map((course, index) => (
          <View key={index} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseGrade}>{course.grade}</Text>
            </View>
            {course.status && (
              <View style={styles.courseStatus}>
                <FontAwesome name="info-circle" size={16} color="#6b7280" />
                <Text style={styles.statusText}>{course.status}</Text>
              </View>
            )}
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
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  weekControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  weekButton: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  // Keep the rest of your existing styles...
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    color: '#4b5563',
  },
  section: {
    margin: 16,
  },
  dateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateWeek: {
    color: '#6b7280',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseCard: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  courseGrade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  courseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#6b7280',
  },
});