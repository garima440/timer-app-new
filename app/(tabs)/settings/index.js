import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHOOL_TIMES_KEY, validateTime } from '../../utils/timeUtils';

export default function Settings() {
  const [schoolTimes, setSchoolTimes] = useState({
    elementary: { startTime: '', endTime: '' },
    middle: { startTime: '', endTime: '' },
    high: { startTime: '', endTime: '' },
    college: { startTime: '', endTime: '' }
  });

  useEffect(() => {
    loadSchoolTimes();
  }, []);

  const loadSchoolTimes = async () => {
    try {
      const savedTimes = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      if (savedTimes) {
        setSchoolTimes(JSON.parse(savedTimes));
      }
    } catch (error) {
      console.error('Error loading school times:', error);
    }
  };

  const saveSchoolTimes = async () => {
    try {
      // First load existing times
      const existingTimesStr = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      const existingTimes = existingTimesStr ? JSON.parse(existingTimesStr) : {
        elementary: { startTime: '', endTime: '' },
        middle: { startTime: '', endTime: '' },
        high: { startTime: '', endTime: '' },
        college: { startTime: '', endTime: '' }
      };
  
      // Validate the times for the stage being updated
      for (const stage in schoolTimes) {
        const { startTime, endTime } = schoolTimes[stage];
        if (startTime && endTime) {
          if (!validateTime(startTime) || !validateTime(endTime)) {
            Alert.alert('Invalid Time Format', 
              `Please use format: HH:MM AM/PM (e.g., 8:30 AM) for ${stage} stage`);
            return;
          }
        }
      }
  
      // Only update the stages that have been modified
      const updatedTimes = {
        ...existingTimes,
        ...schoolTimes
      };
  
      await AsyncStorage.setItem(SCHOOL_TIMES_KEY, JSON.stringify(updatedTimes));
      Alert.alert('Success', 'School times saved successfully');
    } catch (error) {
      console.error('Error saving school times:', error);
      Alert.alert('Error', 'Failed to save school times');
    }
  };

  const updateTime = (stage, timeType, value) => {
    setSchoolTimes(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [timeType]: value
      }
    }));
  };

  const renderStageInputs = (stage, label) => (
    <View style={styles.stageContainer}>
      <Text style={styles.stageLabel}>{label}</Text>
      <View style={styles.timeInputsRow}>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>Start Time</Text>
          <TextInput
            style={styles.input}
            placeholder="8:30 AM"
            value={schoolTimes[stage].startTime}
            onChangeText={(text) => updateTime(stage, 'startTime', text)}
          />
        </View>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>End Time</Text>
          <TextInput
            style={styles.input}
            placeholder="3:30 PM"
            value={schoolTimes[stage].endTime}
            onChangeText={(text) => updateTime(stage, 'endTime', text)}
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>School Hours Settings</Text>
      
      {renderStageInputs('elementary', 'Elementary School')}
      {renderStageInputs('middle', 'Middle School')}
      {renderStageInputs('high', 'High School')}
      {renderStageInputs('college', 'College')}

      <TouchableOpacity style={styles.saveButton} onPress={saveSchoolTimes}>
        <Text style={styles.saveButtonText}>Save All Times</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  stageContainer: {
    marginBottom: 24,
  },
  stageLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  timeInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});