// app/(tabs)/home/index.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const stages = [
  { id: 'elementary', name: 'Elementary School', grades: '1-5', ages: '6-11' },
  { id: 'middle', name: 'Middle School', grades: '6-8', ages: '11-14' },
  { id: 'high', name: 'High School', grades: '9-12', ages: '14-18' },
  { id: 'college', name: 'College', grades: 'Undergraduate', ages: '18-22' },
];

export default function Home() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState(null);

  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    router.push(`/schedule?stage=${stage.id}`);
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
            <Text style={styles.stageName}>{stage.name}</Text>
            <Text style={styles.stageDetails}>Grades: {stage.grades}</Text>
            <Text style={styles.stageDetails}>Ages: {stage.ages}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
});