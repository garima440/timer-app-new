import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar
} from 'react-native';
import { useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStage } from '../../context/StageContext';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign
} from '../../theme';

const SELECTED_STAGE_KEY = 'selectedStage';

const stages = [
  { 
    id: 'elementary', 
    name: 'Elementary School', 
    grades: '1-5', 
    typical_age: '6-11',
  },
  { 
    id: 'middle', 
    name: 'Middle School', 
    grades: '6-8', 
    typical_age: '11-14',
  },
  { 
    id: 'high', 
    name: 'High School', 
    grades: '9-12', 
    typical_age: '14-18',
  },
  { 
    id: 'college', 
    name: 'College', 
    grades: 'Undergraduate', 
    typical_age: '18-22',
  },
];

export default function Home() {
  const { selectedStage, updateSelectedStage } = useStage();

  // Load saved stage on mount
  useEffect(() => {
    loadSelectedStage();
  }, []);

  const loadSelectedStage = async () => {
    try {
      const savedStage = await AsyncStorage.getItem(SELECTED_STAGE_KEY);
      if (savedStage) {
        // Just update with the ID, not the full object
        updateSelectedStage(savedStage);
      }
    } catch (error) {
      console.error('Error loading selected stage:', error);
    }
  };

  const handleStageSelect = async (stage) => {
    console.log('Home - Selecting stage:', stage.id);
    // Pass just the ID to update
    updateSelectedStage(stage.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Select Your Education Stage</Text>
        
        <View style={styles.stageGrid}>
          {stages.map((stage) => {
            const stageDesign = getStageDesign(stage.id);
            const isSelected = selectedStage === stage.id;
            
            return (
              <TouchableOpacity
                key={stage.id}
                style={[
                  styles.stageCard,
                  isSelected && [styles.selectedCard, { borderColor: stageDesign.primaryColor }]
                ]}
                onPress={() => handleStageSelect(stage)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.iconContainer,
                    isSelected && { backgroundColor: stageDesign.primaryColor }
                  ]}>
                    <FontAwesome5 
                      name={stageDesign.icon} 
                      size={22} 
                      color={isSelected ? COLORS.text.inverse : stageDesign.primaryColor} 
                      solid={isSelected}
                    />
                  </View>
                  <Text style={styles.stageName}>{stage.name}</Text>
                </View>
                
                <View style={styles.cardDetails}>
                  <Text style={styles.stageDetails}>Grades: {stage.grades}</Text>
                  <Text style={styles.stageDetails}>Ages: {stage.typical_age}</Text>
                </View>
                
                {isSelected && (
                  <View style={[styles.selectedIndicator, { borderColor: stageDesign.primaryColor }]}>
                    <FontAwesome5 name="check" size={14} color={stageDesign.primaryColor} />
                    <Text style={[styles.selectedText, { color: stageDesign.primaryColor }]}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedStage && (
          <Text style={styles.instruction}>
            Go to the Schedule tab to view your {stages.find(s => s.id === selectedStage)?.name.toLowerCase() || ''} schedule
          </Text>
        )}
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  stageGrid: {
    gap: SPACING.md,
  },
  stageCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  selectedCard: {
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stageName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardDetails: {
    marginLeft: SPACING.xl + SPACING.sm,
  },
  stageDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: SPACING.xl + SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  selectedText: {
    fontWeight: '500',
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.xs / 2,
  },
  instruction: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.md,
    padding: SPACING.sm,
  },
});