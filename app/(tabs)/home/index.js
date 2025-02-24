import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_STAGE_KEY = 'selectedStage';

const stages = [
  { 
    id: 'elementary', 
    name: 'Elementary School', 
    grades: '1-5', 
    ages: '6-11',
    icon: 'book'
  },
  { 
    id: 'middle', 
    name: 'Middle School', 
    grades: '6-8', 
    ages: '11-14',
    icon: 'book'
  },
  { 
    id: 'high', 
    name: 'High School', 
    grades: '9-12', 
    ages: '14-18',
    icon: 'book'
  },
  { 
    id: 'college', 
    name: 'College', 
    grades: 'Undergraduate', 
    ages: '18-22',
    icon: 'graduation-cap'
  },
];

export default function Home() {
  const [selectedStage, setSelectedStage] = useState(null);

  // Load saved stage on mount
  useEffect(() => {
    loadSelectedStage();
  }, []);

  const loadSelectedStage = async () => {
    try {
      const savedStage = await AsyncStorage.getItem(SELECTED_STAGE_KEY);
      if (savedStage) {
        setSelectedStage(stages.find(stage => stage.id === savedStage));
      }
    } catch (error) {
      console.error('Error loading selected stage:', error);
    }
  };

  const handleStageSelect = async (stage) => {
    setSelectedStage(stage);
    try {
      await AsyncStorage.setItem(SELECTED_STAGE_KEY, stage.id);
    } catch (error) {
      console.error('Error saving selected stage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Education Stage</Text>
      
      <View style={styles.stageGrid}>
        {stages.map((stage) => (
          <TouchableOpacity
            key={stage.id}
            style={[
              styles.stageCard,
              selectedStage?.id === stage.id && styles.selectedCard
            ]}
            onPress={() => handleStageSelect(stage)}
          >
            <View style={styles.cardHeader}>
              <FontAwesome name={stage.icon} size={24} color="#4b5563" />
              <Text style={styles.stageName}>{stage.name}</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.stageDetails}>Grades: {stage.grades}</Text>
              <Text style={styles.stageDetails}>Ages: {stage.ages}</Text>
            </View>
            {selectedStage?.id === stage.id && (
              <View style={styles.selectedIndicator}>
                <FontAwesome name="check" size={16} color="#2563eb" />
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedStage && (
        <Text style={styles.instruction}>
          Go to the Schedule tab to view your {selectedStage.name.toLowerCase()} schedule
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stageGrid: {
    gap: 16,
  },
  stageCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDetails: {
    marginLeft: 36,
  },
  stageDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 36,
  },
  selectedText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  instruction: {
    textAlign: 'center',
    color: '#4b5563',
    marginTop: 16,
    fontSize: 16,
  },
});