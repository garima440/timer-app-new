import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useSchoolTimes } from '../../context/SchoolTimeContext';
import { validateTime } from '../../utils/timeUtils';
import { FontAwesome } from '@expo/vector-icons';

export default function Settings() {
  const { schoolTimes, updateTimes } = useSchoolTimes();
  const [expandedStage, setExpandedStage] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [tempSettings, setTempSettings] = useState({ 
    startTime: '', 
    endTime: '',
    yearStart: '', // Format: MM/DD/YYYY
    yearEnd: ''    // Format: MM/DD/YYYY
  });

  const handleExpand = (stage) => {
    setExpandedStage(expandedStage === stage ? null : stage);
  };

  const handleEdit = (stage) => {
    setEditingStage(stage);
    // Use existing values or initialize with empty strings
    setTempSettings({
      startTime: schoolTimes[stage]?.startTime || '',
      endTime: schoolTimes[stage]?.endTime || '',
      yearStart: schoolTimes[stage]?.yearStart || '',
      yearEnd: schoolTimes[stage]?.yearEnd || ''
    });
  };

  const validateDate = (dateString) => {
    // Allow empty dates (for optional fields)
    if (!dateString) return true;
    
    // Basic MM/DD/YYYY validation
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return regex.test(dateString);
  };

  const handleSave = async (stage) => {
    // Validate time formats
    if (!validateTime(tempSettings.startTime) || !validateTime(tempSettings.endTime)) {
      Alert.alert('Invalid Time Format', 'Please use format: HH:MM AM/PM (e.g., 8:30 AM)');
      return;
    }

    // Validate date formats if provided
    if ((tempSettings.yearStart && !validateDate(tempSettings.yearStart)) || 
        (tempSettings.yearEnd && !validateDate(tempSettings.yearEnd))) {
      Alert.alert('Invalid Date Format', 'Please use format: MM/DD/YYYY (e.g., 09/01/2023)');
      return;
    }

    const success = await updateTimes(stage, tempSettings);
    if (success) {
      Alert.alert('Success', 'School settings saved successfully');
      setEditingStage(null);
    } else {
      Alert.alert('Error', 'Failed to save school settings');
    }
  };

  const renderStageCard = (stage, label, icon) => {
    const isExpanded = expandedStage === stage;
    const isEditing = editingStage === stage;
    const settings = schoolTimes[stage] || {};

    return (
      <View style={styles.stageCard} key={stage}>
        <TouchableOpacity 
          style={styles.stageHeader} 
          onPress={() => handleExpand(stage)}
        >
          <View style={styles.stageInfo}>
            <FontAwesome name={icon} size={20} color="#4b5563" />
            <Text style={styles.stageLabel}>{label}</Text>
          </View>
          <FontAwesome 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#4b5563" 
          />
        </TouchableOpacity>

        {isExpanded && !isEditing && (
          <View style={styles.stageDetails}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Daily Schedule</Text>
              <Text style={styles.detailText}>
                Start: {settings.startTime || 'Not set'}
              </Text>
              <Text style={styles.detailText}>
                End: {settings.endTime || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <Text style={styles.detailText}>
                Start: {settings.yearStart || 'Not set'}
              </Text>
              <Text style={styles.detailText}>
                End: {settings.yearEnd || 'Not set'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEdit(stage)}
            >
              <Text style={styles.editButtonText}>Edit Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {isExpanded && isEditing && (
          <View style={styles.editForm}>
            <Text style={styles.formSectionTitle}>Daily Schedule</Text>
            <TextInput
              style={styles.input}
              placeholder="Start Time (e.g., 8:30 AM)"
              value={tempSettings.startTime}
              onChangeText={(text) => setTempSettings(prev => ({ ...prev, startTime: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="End Time (e.g., 3:30 PM)"
              value={tempSettings.endTime}
              onChangeText={(text) => setTempSettings(prev => ({ ...prev, endTime: text }))}
            />
            
            <Text style={styles.formSectionTitle}>Academic Year</Text>
            <TextInput
              style={styles.input}
              placeholder="Year Start (MM/DD/YYYY)"
              value={tempSettings.yearStart}
              onChangeText={(text) => setTempSettings(prev => ({ ...prev, yearStart: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Year End (MM/DD/YYYY)"
              value={tempSettings.yearEnd}
              onChangeText={(text) => setTempSettings(prev => ({ ...prev, yearEnd: text }))}
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>School Settings</Text>
        
        {renderStageCard('elementary', 'Elementary School', 'child')}
        {renderStageCard('middle', 'Middle School', 'book')}
        {renderStageCard('high', 'High School', 'graduation-cap')}
        {renderStageCard('college', 'College', 'university')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  stageCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0,
    borderBottomColor: '#e5e7eb',
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  stageDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  editForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
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
    fontWeight: '500',
    fontSize: 14,
  },
});