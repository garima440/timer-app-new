import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { useStage } from '../../context/StageContext';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign
} from '../../theme';

// Define views with more specific configuration for each stage
const timeViews = {
  elementary: [
    { id: 'day', name: 'Day View', icon: 'clock', description: 'Class by class schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-alt', description: 'Weekly class routine' },
    { id: 'quarter', name: 'Quarter View', icon: 'calendar-check', description: '9-week periods' },
  ],
  middle: [
    { id: 'day', name: 'Day View', icon: 'clock', description: 'Period by period' },
    { id: 'week', name: 'Week View', icon: 'calendar-alt', description: 'Weekly schedule' },
    { id: 'trimester', name: 'Trimester View', icon: 'calendar-check', description: '12-week periods' },
  ],
  high: [
    { id: 'day', name: 'Day View', icon: 'clock', description: 'Block/period schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-alt', description: 'Weekly schedule' },
    { id: 'semester', name: 'Semester View', icon: 'calendar-check', description: '18-week periods' },
  ],
  college: [
    { id: 'day', name: 'Day View', icon: 'clock', description: 'Class schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-alt', description: 'Weekly schedule' },
    { id: 'semester', name: 'Semester View', icon: 'calendar-check', description: '15-16 week periods' },
  ],
};

export default function Schedule() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState(null);
  
  // Get the selected stage from context
  const { selectedStage, stageDetails } = useStage();

  // Get views specific to the current stage
  const views = timeViews[selectedStage] || [];
  
  // Get stage-specific design
  const stageDesign = getStageDesign(selectedStage || 'high');
  
  const handleViewSelect = (view) => {
    console.log('Selected Stage:', selectedStage);
    console.log('Selected View:', view);

    if (!selectedStage) {
      console.log('No stage selected');
      alert('Please select your education stage in the Home tab first');
      return;
    }
    
    console.log('Navigating with:', {
      path: `/schedule/${view.id}`,
      stage: selectedStage
    });

    setSelectedView(view);
    router.push(`/schedule/${view.id}?stage=${selectedStage}`);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <View style={[styles.stageIndicator, { backgroundColor: stageDesign.primaryColor }]}>
            <FontAwesome5 name={stageDesign.icon} size={14} color={COLORS.text.inverse} />
            <Text style={styles.stageText}>{stageDetails?.name || 'Select Stage'}</Text>
          </View>
        </View>
        
        {views.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="calendar-alt" size={60} color={COLORS.neutral[300]} />
            <Text style={styles.emptyTitle}>No Schedule Available</Text>
            <Text style={styles.emptyText}>
              Please select your education level in the Home tab first
            </Text>
          </View>
        ) : (
          <View style={styles.viewGrid}>
            {views.map((view) => (
              <TouchableOpacity
                key={view.id}
                style={[
                  styles.viewCard,
                  selectedView?.id === view.id && [
                    styles.selectedCard, 
                    { borderColor: stageDesign.primaryColor }
                  ]
                ]}
                onPress={() => handleViewSelect(view)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: selectedView?.id === view.id ? stageDesign.primaryColor : COLORS.neutral[100] }
                ]}>
                  <FontAwesome5 
                    name={view.icon} 
                    size={22} 
                    color={selectedView?.id === view.id ? COLORS.text.inverse : stageDesign.primaryColor} 
                    solid={selectedView?.id === view.id}
                  />
                </View>
                <View style={styles.viewDetails}>
                  <Text style={styles.viewName}>{view.name}</Text>
                  <Text style={styles.viewDescription}>{view.description}</Text>
                </View>
                <FontAwesome5 
                  name="chevron-right" 
                  size={16} 
                  color={selectedView?.id === view.id ? stageDesign.primaryColor : COLORS.neutral[400]} 
                />
              </TouchableOpacity>
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  stageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  stageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  viewGrid: {
    gap: SPACING.md,
  },
  viewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    ...SHADOWS.sm,
  },
  selectedCard: {
    backgroundColor: COLORS.background.secondary,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  viewDetails: {
    flex: 1,
  },
  viewName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  viewDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
});