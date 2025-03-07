// app/(tabs)/profile/index.js
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Animated, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useStage } from '../../context/StageContext';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign,
  ANIMATION
} from '../../theme';

const stages = [
  { 
    age: 6, 
    id: 'elementary',
    stage: 'Elementary School', 
    description: 'Beginning of formal education', 
  },
  { 
    age: 11, 
    id: 'middle',
    stage: 'Middle School', 
    description: 'New challenges and independence', 
  },
  { 
    age: 14, 
    id: 'high',
    stage: 'High School', 
    description: 'Preparing for future success', 
  },
  { 
    age: 18, 
    id: 'college',
    stage: 'College', 
    description: 'Higher education journey', 
  },
  { 
    age: 22, 
    id: 'graduate',
    stage: 'Graduate', 
    description: 'Ready for career', 
  }
];

export default function Profile() {
  const { selectedStage, updateSelectedStage } = useStage();
  const [currentAge, setCurrentAge] = useState(14);
  const [animateProgress, setAnimateProgress] = useState(false);
  const growAnimation = useRef(new Animated.Value(0.8)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Get stage info for current age
  const getCurrentStage = (age) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (age >= stages[i].age) return stages[i];
    }
    return stages[0];
  };

  // Get next upcoming stage
  const getNextStage = (age) => {
    for (let stage of stages) {
      if (age < stage.age) return stage;
    }
    return null;
  };

  // Get stage design for visualization
  const getStageById = (stageId) => {
    return stages.find(s => s.id === stageId) || stages[2]; // Default to high school
  };

  const currentStage = getCurrentStage(currentAge);
  const nextStage = getNextStage(currentAge);

  // Animation effect
  useEffect(() => {
    // Animate avatar growth
    Animated.spring(growAnimation, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Calculate progress percentage to show in timeline
    const calculateProgress = () => {
      const currentStageIndex = stages.findIndex(s => s.id === currentStage.id);
      const nextStageIndex = stages.findIndex(s => s.id === (nextStage?.id || 'graduate'));
      
      if (currentStageIndex === -1) return 0;
      
      const currentStageAge = stages[currentStageIndex].age;
      const nextStageAge = nextStage ? nextStage.age : stages[stages.length - 1].age + 4;
      const ageRange = nextStageAge - currentStageAge;
      
      return ((currentAge - currentStageAge) / ageRange) * 100;
    };
    
    // Animate progress bar
    setAnimateProgress(true);
    const progress = calculateProgress();
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: ANIMATION.medium,
      useNativeDriver: false
    }).start(() => setAnimateProgress(false));
    
    // If selected stage doesn't match current age, suggest updating it
    if (selectedStage !== currentStage.id && currentStage.id !== 'graduate') {
      // This could be a prompt, but we're just automatically updating for now
      updateSelectedStage(currentStage.id);
    }
  }, [currentAge]);

  // Animation interpolation for progress
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Avatar customization based on age
  const getAvatarStyle = (age) => {
    const MIN_HEIGHT = 120;
    const MAX_HEIGHT = 200;
    const height = MIN_HEIGHT + (age - 6) * 6; // Increases height with age
    
    return {
      height: Math.min(height, MAX_HEIGHT), // Max height
      width: Math.min(height * 0.65, MAX_HEIGHT * 0.65), // Proportional width
    };
  };

  // Get stage-specific design
  const stageDesign = getStageDesign(currentStage.id);
  const nextStageDesign = nextStage ? getStageDesign(nextStage.id) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Educational Journey</Text>
          <Text style={styles.subtitle}>Track your progress through school</Text>
        </View>

        {/* Avatar Visualization */}
        <View style={[styles.avatarCard, { borderColor: stageDesign.primaryColor }]}>
          <Animated.View
            style={[
              styles.avatarContainer,
              { transform: [{ scale: growAnimation }] },
            ]}
          >
            <View style={[styles.avatar, getAvatarStyle(currentAge)]}>
              <View style={[
                styles.avatarHead, 
                { backgroundColor: stageDesign.primaryColor }
              ]}>
                <Text style={styles.ageText}>{currentAge}</Text>
              </View>
              <View style={[
                styles.avatarBody, 
                { backgroundColor: stageDesign.primaryColor }
              ]} />
            </View>
            
            <View style={styles.stageInfo}>
              <View style={styles.stageNameContainer}>
                <FontAwesome5 
                  name={stageDesign.icon} 
                  size={18} 
                  color={stageDesign.primaryColor} 
                  solid
                  style={styles.stageIcon}
                />
                <Text style={[styles.stageName, { color: stageDesign.primaryColor }]}>
                  {currentStage.stage}
                </Text>
              </View>
              <Text style={styles.stageDescription}>{currentStage.description}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Age Slider */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderLabel}>
            <Text style={styles.sliderTitle}>Your Age</Text>
            <View style={[styles.ageIndicator, { backgroundColor: stageDesign.primaryColor }]}>
              <Text style={styles.ageIndicatorText}>{currentAge}</Text>
            </View>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={6}
            maximumValue={22}
            step={1}
            value={currentAge}
            onValueChange={setCurrentAge}
            minimumTrackTintColor={stageDesign.primaryColor}
            maximumTrackTintColor={COLORS.neutral[200]}
            thumbTintColor={stageDesign.primaryColor}
          />
          
          <View style={styles.sliderRangeLabels}>
            <Text style={styles.rangeLabel}>6</Text>
            <Text style={styles.rangeLabel}>22</Text>
          </View>
        </View>

        {/* Stage Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Educational Stages</Text>
          
          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />
            
            {/* Timeline Stage Markers */}
            {stages.map((stage, index) => {
              const isActive = currentAge >= stage.age;
              const stageSpecificDesign = getStageDesign(stage.id);
              const isCurrent = currentStage.id === stage.id;
              
              return (
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
                      isActive && { backgroundColor: stageSpecificDesign.primaryColor, transform: [{ scale: 1.2 }] },
                      isCurrent && styles.currentDot,
                    ]}
                  />
                  <Text style={[
                    styles.timelineAge,
                    isActive && { color: stageSpecificDesign.primaryColor, fontWeight: '600' }
                  ]}>
                    {stage.age}
                  </Text>
                  {isCurrent && (
                    <View style={[
                      styles.currentIndicator, 
                      { borderTopColor: stageSpecificDesign.primaryColor }
                    ]} />
                  )}
                </View>
              );
            })}
            
            {/* Current progress in stage */}
            {currentStage && nextStage && (
              <View style={styles.progressContainer}>
                <View style={[
                  styles.progressSection,
                  { 
                    left: `${((currentStage.age - 6) / 16) * 100}%`,
                    width: `${((nextStage.age - currentStage.age) / 16) * 100}%`,
                  }
                ]}>
                  <Animated.View 
                    style={[
                      styles.progressBar,
                      { width: progressWidth, backgroundColor: stageDesign.primaryColor }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Current & Next Stage Cards */}
        <View style={styles.stagesSection}>
          {/* Current Stage Card */}
          <View style={[styles.stageCard, { borderColor: stageDesign.primaryColor }]}>
            <View style={styles.stageCardHeader}>
              <View style={styles.stageCardTitle}>
                <FontAwesome5 
                  name="clock" 
                  size={14} 
                  color={stageDesign.primaryColor}
                  style={styles.stageCardIcon}
                />
                <Text style={styles.stageCardTitleText}>Current Stage</Text>
              </View>
              <View style={[
                styles.stageCardIndicator, 
                { backgroundColor: stageDesign.primaryColor }
              ]}>
                <FontAwesome5 name={stageDesign.icon} size={18} color={COLORS.text.inverse} />
              </View>
            </View>
            
            <Text style={styles.stageCardName}>{currentStage.stage}</Text>
            <Text style={styles.stageCardDescription}>{currentStage.description}</Text>
            
            {nextStage && (
              <View style={styles.stageProgress}>
                <Text style={styles.stageProgressLabel}>
                  {Math.round(((currentAge - currentStage.age) / (nextStage.age - currentStage.age)) * 100)}% complete
                </Text>
                <View style={styles.stageProgressBar}>
                  <View 
                    style={[
                      styles.stageProgressFill,
                      { 
                        width: `${((currentAge - currentStage.age) / (nextStage.age - currentStage.age)) * 100}%`,
                        backgroundColor: stageDesign.primaryColor
                      }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
          
          {/* Next Stage Card */}
          {nextStage && (
            <View style={[styles.stageCard, styles.nextStageCard, { borderColor: nextStageDesign.primaryColor }]}>
              <View style={styles.stageCardHeader}>
                <View style={styles.stageCardTitle}>
                  <FontAwesome5 
                    name="calendar-alt" 
                    size={14} 
                    color={nextStageDesign.primaryColor}
                    style={styles.stageCardIcon}
                  />
                  <Text style={styles.stageCardTitleText}>Next Stage</Text>
                </View>
                <View style={[
                  styles.stageCardIndicator, 
                  { backgroundColor: nextStageDesign.primaryColor }
                ]}>
                  <FontAwesome5 name={nextStageDesign.icon} size={18} color={COLORS.text.inverse} />
                </View>
              </View>
              
              <Text style={styles.stageCardName}>{nextStage.stage}</Text>
              <Text style={styles.stageCardDescription}>{nextStage.description}</Text>
              
              <View style={styles.yearsContainer}>
                <FontAwesome5 
                  name="hourglass-half" 
                  size={14} 
                  color={nextStageDesign.primaryColor}
                  style={styles.yearsIcon}
                />
                <Text style={[styles.yearsText, { color: nextStageDesign.primaryColor }]}>
                  in {nextStage.age - currentAge} {nextStage.age - currentAge === 1 ? 'year' : 'years'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  avatarCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarHead: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    color: COLORS.text.inverse,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  avatarBody: {
    flex: 1,
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  stageInfo: {
    alignItems: 'center',
  },
  stageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stageIcon: {
    marginRight: SPACING.xs,
  },
  stageName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  stageDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sliderSection: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sliderLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sliderTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  ageIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
  },
  ageIndicatorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.xs,
  },
  rangeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.tertiary,
  },
  timelineSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  timelineContainer: {
    height: 60,
    marginVertical: SPACING.md,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.xs,
  },
  progressContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 3,
  },
  progressSection: {
    position: 'absolute',
    height: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  },
  timelinePoint: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
    transform: [{ translateX: -8 }],
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.neutral[300],
    borderWidth: 2,
    borderColor: COLORS.background.primary,
    zIndex: 1,
  },
  currentDot: {
    transform: [{ scale: 1.5 }],
    ...SHADOWS.xs,
  },
  currentIndicator: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  timelineAge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  stagesSection: {
    marginBottom: SPACING.lg,
  },
  stageCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  nextStageCard: {
    backgroundColor: COLORS.background.secondary,
  },
  stageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stageCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageCardIcon: {
    marginRight: SPACING.xs,
  },
  stageCardTitleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  stageCardIndicator: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageCardName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  stageCardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  stageProgress: {
    marginTop: SPACING.xs,
  },
  stageProgressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  stageProgressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
  },
  stageProgressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  },
  yearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearsIcon: {
    marginRight: SPACING.xs,
  },
  yearsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
});