import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const STORAGE_KEY = 'trimesterData';

export default function TrimesterView() {
  const { stage } = useLocalSearchParams();
  const [trimesterData, setTrimesterData] = useState({
    currentWeek: 1,
    totalWeeks: 12,
    importantDates: [],
    subjects: []
  });
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [newDate, setNewDate] = useState({ event: '', week: '', status: 'upcoming' });
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    grade: '', 
    status: '',
    assignments: [] 
  });

  useEffect(() => {
    loadData();
  }, [stage]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setTrimesterData(parsedData[stage] || {
          currentWeek: 1,
          totalWeeks: 12,
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
      Alert.alert('Missing Information', 'Please fill in both the event and week');
      return;
    }

    const updatedDates = [...trimesterData.importantDates, newDate]
      .sort((a, b) => Number(a.week) - Number(b.week));

    const updatedData = {
      ...trimesterData,
      importantDates: updatedDates
    };

    setTrimesterData(updatedData);
    saveData(updatedData);
    setNewDate({ event: '', week: '', status: 'upcoming' });
  };

  const addSubject = () => {
    if (!newSubject.name) {
      Alert.alert('Missing Information', 'Please enter at least the subject name');
      return;
    }

    const updatedSubjects = [...trimesterData.subjects, newSubject];
    const updatedData = {
      ...trimesterData,
      subjects: updatedSubjects
    };

    setTrimesterData(updatedData);
    saveData(updatedData);
    setNewSubject({ 
      name: '', 
      grade: '', 
      status: '',
      assignments: [] 
    });
  };

  const updateWeek = (increment) => {
    const newWeek = Math.min(
      Math.max(1, trimesterData.currentWeek + increment),
      trimesterData.totalWeeks
    );
    
    const updatedData = {
      ...trimesterData,
      currentWeek: newWeek
    };
    
    setTrimesterData(updatedData);
    saveData(updatedData);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#f87171';
    if (progress < 70) return '#fbbf24';
    return '#34d399';
  };

  const getGradeColor = (grade) => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return '#6b7280';
    if (numGrade >= 90) return '#34d399';
    if (numGrade >= 80) return '#60a5fa';
    if (numGrade >= 70) return '#fbbf24';
    return '#f87171';
  };

  const progress = (trimesterData.currentWeek / trimesterData.totalWeeks) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trimester {stage}</Text>

      {/* Progress Section */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Progress Tracker</Text>
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
            Week {trimesterData.currentWeek} of {trimesterData.totalWeeks}
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

        {trimesterData.importantDates.map((date, index) => (
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

      {/* Subjects Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Classes</Text>
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
              placeholder="Class Name"
              value={newSubject.name}
              onChangeText={(text) => setNewSubject({ ...newSubject, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Current Grade"
              value={newSubject.grade}
              onChangeText={(text) => setNewSubject({ ...newSubject, grade: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={newSubject.status}
              onChangeText={(text) => setNewSubject({ ...newSubject, status: text })}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addSubject}
            >
              <Text style={styles.addButtonText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        )}

        {trimesterData.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={[
                styles.subjectGrade,
                { color: getGradeColor(subject.grade) }
              ]}>
                {subject.grade}
              </Text>
            </View>
            {subject.status && (
              <View style={styles.subjectStatus}>
                <FontAwesome name="info-circle" size={16} color="#6b7280" />
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
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#1e40af',
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    elevation: 2,
  },
  weekControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  weekButton: {
    backgroundColor: '#1e40af',
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: '#1e40af',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#1e40af',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e40af',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    color: '#475569',
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
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  dateWeek: {
    color: '#64748b',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectCard: {
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  subjectGrade: {
    fontSize: 16,
    fontWeight: '600',
  },
  subjectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#64748b',
    fontSize: 14,
  },
});