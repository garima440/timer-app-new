import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const STORAGE_KEY = 'quarterData';

export default function QuarterView() {
  const { stage } = useLocalSearchParams();
  const [quarterData, setQuarterData] = useState({
    currentWeek: 1,
    totalWeeks: 9,
    importantDates: [],
    subjects: []
  });
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [newDate, setNewDate] = useState({ event: '', week: '', status: 'coming up' });
  const [newSubject, setNewSubject] = useState({ name: '', grade: '😊', status: '' });

  useEffect(() => {
    loadData();
  }, [stage]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setQuarterData(parsedData[stage] || {
          currentWeek: 1,
          totalWeeks: 9,
          importantDates: [],
          subjects: []
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
      Alert.alert('Oops!', 'Please fill in all the boxes');
      return;
    }

    const updatedDates = [...quarterData.importantDates, newDate]
      .sort((a, b) => Number(a.week) - Number(b.week));

    const updatedData = {
      ...quarterData,
      importantDates: updatedDates
    };

    setQuarterData(updatedData);
    saveData(updatedData);
    setNewDate({ event: '', week: '', status: 'coming up' });
  };

  const addSubject = () => {
    if (!newSubject.name) {
      Alert.alert('Oops!', 'Please enter the subject name');
      return;
    }

    const updatedSubjects = [...quarterData.subjects, newSubject];
    const updatedData = {
      ...quarterData,
      subjects: updatedSubjects
    };

    setQuarterData(updatedData);
    saveData(updatedData);
    setNewSubject({ name: '', grade: '😊', status: '' });
  };

  const updateWeek = (increment) => {
    const newWeek = Math.min(
      Math.max(1, quarterData.currentWeek + increment),
      quarterData.totalWeeks
    );
    
    const updatedData = {
      ...quarterData,
      currentWeek: newWeek
    };
    
    setQuarterData(updatedData);
    saveData(updatedData);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#ff9999'; // Lighter red
    if (progress < 70) return '#ffdb4d'; // Lighter yellow
    return '#77dd77'; // Lighter green
  };

  const getProgressEmoji = (progress) => {
    if (progress < 30) return '🏃';
    if (progress < 70) return '🚶';
    return '🎉';
  };

  const progress = (quarterData.currentWeek / quarterData.totalWeeks) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Quarter {stage}</Text>

      {/* Progress Section */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>My Progress {getProgressEmoji(progress)}</Text>
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
            Week {quarterData.currentWeek} of {quarterData.totalWeeks}
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
          <Text style={styles.sectionTitle}>Important Days 📅</Text>
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
              placeholder="What's the event?"
              value={newDate.event}
              onChangeText={(text) => setNewDate({ ...newDate, event: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Which week?"
              value={newDate.week}
              keyboardType="numeric"
              onChangeText={(text) => setNewDate({ ...newDate, week: text })}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addImportantDate}
            >
              <Text style={styles.addButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>
        )}

        {quarterData.importantDates.map((date, index) => (
          <View key={index} style={styles.dateCard}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateTitle}>{date.event}</Text>
              <Text style={styles.dateWeek}>Week {date.week}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: date.status === 'done' ? '#dcfce7' : '#fef9c3' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: date.status === 'done' ? '#166534' : '#854d0e' }
              ]}>
                {date.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Subjects Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Subjects 📚</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditingSubjects(!isEditingSubjects)}
          >
            <Text style={styles.editButtonText}>
              {isEditingSubjects ? 'Done' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingSubjects && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Subject Name"
              value={newSubject.name}
              onChangeText={(text) => setNewSubject({ ...newSubject, name: text })}
            />
            <View style={styles.gradeSelector}>
              <TouchableOpacity
                style={[styles.gradeBadge, newSubject.grade === '😊' && styles.selectedGrade]}
                onPress={() => setNewSubject({ ...newSubject, grade: '😊' })}
              >
                <Text style={styles.gradeEmoji}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gradeBadge, newSubject.grade === '😐' && styles.selectedGrade]}
                onPress={() => setNewSubject({ ...newSubject, grade: '😐' })}
              >
                <Text style={styles.gradeEmoji}>😐</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gradeBadge, newSubject.grade === '😢' && styles.selectedGrade]}
                onPress={() => setNewSubject({ ...newSubject, grade: '😢' })}
              >
                <Text style={styles.gradeEmoji}>😢</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addSubject}
            >
              <Text style={styles.addButtonText}>Add Subject</Text>
            </TouchableOpacity>
          </View>
        )}

        {quarterData.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectGrade}>{subject.grade}</Text>
            </View>
            {subject.status && (
              <View style={styles.subjectStatus}>
                <FontAwesome name="star" size={16} color="#fbbf24" />
                <Text style={styles.statusText}>{subject.status}</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#4338ca',
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  weekControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  weekButton: {
    backgroundColor: '#4338ca',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#4338ca',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gradeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  gradeBadge: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedGrade: {
    borderColor: '#4338ca',
    backgroundColor: '#e0e7ff',
  },
  gradeEmoji: {
    fontSize: 24,
  },
  addButton: {
    backgroundColor: '#4338ca',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e1b4b',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'center',
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    margin: 16,
  },
  dateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e1b4b',
  },
  dateWeek: {
    color: '#6b7280',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subjectCard: {
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e1b4b',
  },
  subjectGrade: {
    fontSize: 24,
  },
  subjectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  // Additional styles for the grade selector
  gradeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  gradeBadge: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedGrade: {
    borderColor: '#4338ca',
    backgroundColor: '#e0e7ff',
    transform: [{ scale: 1.1 }],
  },
  gradeEmoji: {
    fontSize: 24,
  },
});