// app/(tabs)/profile/index.js
import { View, Text, StyleSheet, Image, Animated, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';

const stages = [
  { age: 6, stage: 'Elementary School Start', description: 'Beginning of formal education', icon: '🏫' },
  { age: 11, stage: 'Middle School', description: 'New challenges and independence', icon: '📚' },
  { age: 14, stage: 'High School', description: 'Preparing for future success', icon: '🎓' },
  { age: 18, stage: 'College', description: 'Higher education journey', icon: '🎯' },
  { age: 22, stage: 'Graduate', description: 'Ready for career', icon: '✨' }
];

export default function Profile() {
  const [currentAge, setCurrentAge] = useState(10);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const getCurrentStage = (age) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (age >= stages[i].age) return stages[i];
    }
    return stages[0];
  };

  const getNextStage = (age) => {
    for (let stage of stages) {
      if (age < stage.age) return stage;
    }
    return null;
  };

  const currentStage = getCurrentStage(currentAge);
  const nextStage = getNextStage(currentAge);

  // Avatar customization based on age
  const getAvatarStyle = (age) => {
    const height = 100 + (age - 6) * 10; // Increases height with age
    return {
      height: Math.min(height, 200), // Max height
      width: Math.min(height * 0.6, 120), // Proportional width
    };
  };

  return (
    <ScrollView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>Your Educational Journey</Text>

      {/* Avatar Visualization */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, getAvatarStyle(currentAge)]}>
          <View style={styles.avatarHead}>
            <Text style={styles.ageText}>Age {currentAge}</Text>
          </View>
          <View style={styles.avatarBody} />
        </View>
      </View>

      {/* Age Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Adjust Age: {currentAge}</Text>
        <Slider
          style={styles.slider}
          minimumValue={6}
          maximumValue={22}
          step={1}
          value={currentAge}
          onValueChange={setCurrentAge}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#e5e7eb"
        />
      </View>

      {/* Current Stage Info */}
      <View style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <Text style={styles.stageTitle}>Current Stage</Text>
          <Text style={styles.stageEmoji}>{currentStage.icon}</Text>
        </View>
        <Text style={styles.stageName}>{currentStage.stage}</Text>
        <Text style={styles.stageDescription}>{currentStage.description}</Text>
      </View>

      {/* Next Stage Info */}
      {nextStage && (
        <View style={styles.nextStageCard}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageTitle}>Next Stage</Text>
            <Text style={styles.stageEmoji}>{nextStage.icon}</Text>
          </View>
          <Text style={styles.stageName}>{nextStage.stage}</Text>
          <Text style={styles.yearsUntil}>
            in {nextStage.age - currentAge} years
          </Text>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.timeline}>
        {stages.map((stage, index) => (
          <View
            key={index}
            style={[
              styles.timelinePoint,
              { left: `${((stage.age - 6) / 16) * 100}%` }
            ]}
          >
            <View
              style={[
                styles.timelineDot,
                currentAge >= stage.age && styles.timelineDotActive
              ]}
            />
            <Text style={styles.timelineAge}>{stage.age}</Text>
          </View>
        ))}
        <View style={styles.timelineLine} />
      </View>
    </View>
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
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    alignItems: 'center',
  },
  avatarHead: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarBody: {
    backgroundColor: '#2563eb',
    flex: 1,
    width: '100%',
    borderRadius: 10,
    marginTop: 5,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  stageCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  nextStageCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  stageEmoji: {
    fontSize: 24,
  },
  stageName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stageDescription: {
    color: '#6b7280',
  },
  yearsUntil: {
    color: '#2563eb',
    fontWeight: '500',
  },
  timeline: {
    height: 40,
    marginTop: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e5e7eb',
  },
  timelinePoint: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -6 }],
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  timelineDotActive: {
    backgroundColor: '#2563eb',
  },
  timelineAge: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});