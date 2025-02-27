import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useSchoolTimes } from '../../context/SchoolTimeContext';
import { validateTime } from '../../utils/timeUtils';

export default function Settings() {
  const { schoolTimes, updateTimes } = useSchoolTimes();
  const [editingStage, setEditingStage] = useState(null);
  const [tempTimes, setTempTimes] = useState({ startTime: '', endTime: '' });

  const handleEdit = (stage) => {
    setEditingStage(stage);
    setTempTimes(schoolTimes[stage]);
  };

  const handleSave = async (stage) => {
    if (!validateTime(tempTimes.startTime) || !validateTime(tempTimes.endTime)) {
      Alert.alert('Invalid Time Format', 'Please use format: HH:MM AM/PM (e.g., 8:30 AM)');
      return;
    }

    const success = await updateTimes(stage, tempTimes);
    if (success) {
      Alert.alert('Success', 'School times saved successfully');
      setEditingStage(null);
    } else {
      Alert.alert('Error', 'Failed to save school times');
    }
  };

  const renderStageSettings = (stage, label) => {
    const isEditing = editingStage === stage;
    const times = isEditing ? tempTimes : schoolTimes[stage];

    return (
      <View style={styles.stageContainer} key={stage}>
        <Text style={styles.stageLabel}>{label}</Text>
        {!isEditing ? (
          <>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                Start: {times.startTime || 'Not set'}
              </Text>
              <Text style={styles.timeText}>
                End: {times.endTime || 'Not set'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEdit(stage)}
            >
              <Text style={styles.editButtonText}>Edit Times</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              placeholder="Start Time (e.g., 8:30 AM)"
              value={tempTimes.startTime}
              onChangeText={(text) => setTempTimes(prev => ({ ...prev, startTime: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="End Time (e.g., 3:30 PM)"
              value={tempTimes.endTime}
              onChangeText={(text) => setTempTimes(prev => ({ ...prev, endTime: text }))}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditingStage(null)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={() => handleSave(stage)}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>School Hours Settings</Text>
      {renderStageSettings('elementary', 'Elementary School')}
      {renderStageSettings('middle', 'Middle School')}
      {renderStageSettings('high', 'High School')}
      {renderStageSettings('college', 'College')}
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
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  stageLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  timeDisplay: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  editForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});