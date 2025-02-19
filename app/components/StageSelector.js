// components/StageSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StageIcon = {
  elementary: 'child',
  middle: 'book',
  high: 'graduation-cap',
  college: 'university'
};

export const StageSelector = ({ stages, selectedStage, onSelect }) => {
  return (
    <View style={styles.container}>
      {stages.map((stage) => (
        <TouchableOpacity
          key={stage.id}
          style={[
            styles.stageCard,
            selectedStage?.id === stage.id && styles.selectedCard,
          ]}
          onPress={() => onSelect(stage)}
        >
          <View style={styles.iconContainer}>
            <FontAwesome 
              name={StageIcon[stage.id] || 'book'} 
              size={24} 
              color={selectedStage?.id === stage.id ? '#2563eb' : '#6b7280'} 
            />
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>{stage.name}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.stageDetails}>Grades: {stage.grades}</Text>
              <Text style={styles.stageDetails}>Ages: {stage.typical_age}</Text>
            </View>
          </View>
          {selectedStage?.id === stage.id && (
            <View style={styles.checkmark}>
              <FontAwesome name="check-circle" size={20} color="#2563eb" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  detailsContainer: {
    gap: 2,
  },
  stageDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  checkmark: {
    marginLeft: 12,
  }
});

export default StageSelector;