import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export const AgeProgressView = ({ 
  currentAge,
  onAgeChange,
  stages,
  getCurrentStage,
  getNextStage 
}) => {
  const currentStage = getCurrentStage(currentAge);
  const nextStage = getNextStage(currentAge);

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { height: 100 + (currentAge - 6) * 5 }]}>
          <View style={styles.avatarHead}>
            <Text style={styles.ageText}>Age {currentAge}</Text>
          </View>
          <View style={styles.avatarBody} />
        </View>
      </View>

      {/* Age Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Age: {currentAge}</Text>
        <Slider
          style={styles.slider}
          minimumValue={6}
          maximumValue={22}
          step={1}
          value={currentAge}
          onValueChange={onAgeChange}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#e5e7eb"
        />
      </View>

      {/* Stage Information */}
      <View style={styles.stageInfo}>
        <View style={styles.currentStage}>
          <Text style={styles.stageTitle}>Current Stage</Text>
          <Text style={styles.stageName}>{currentStage.stage}</Text>
          <Text style={styles.stageDescription}>{currentStage.description}</Text>
        </View>

        {nextStage && (
          <View style={styles.nextStage}>
            <Text style={styles.stageTitle}>Next Stage</Text>
            <Text style={styles.stageName}>{nextStage.stage}</Text>
            <Text style={styles.yearsUntil}>
              in {nextStage.age - currentAge} years
            </Text>
          </View>
        )}
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  avatarSection: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    alignItems: 'center',
  },
  avatarHead: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  stageInfo: {
    gap: 12,
  },
  currentStage: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
  },
  nextStage: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
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

export default AgeProgressView;