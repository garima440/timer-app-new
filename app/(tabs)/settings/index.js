import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { useState, useRef } from 'react';
import { useSchoolTimes } from '../../context/SchoolTimeContext';
import { validateTime } from '../../utils/timeUtils';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign,
  ANIMATION
} from '../../theme';

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
  
  // Animation for card expansion
  const expandAnimation = useRef(new Animated.Value(0)).current;

  const handleExpand = (stage) => {
    // If already expanded, collapse it
    if (expandedStage === stage) {
      setExpandedStage(null);
      setEditingStage(null);
      
      Animated.timing(expandAnimation, {
        toValue: 0,
        duration: ANIMATION.medium,
        useNativeDriver: false,
      }).start();
    } else {
      // Otherwise expand it
      setExpandedStage(stage);
      
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: ANIMATION.medium,
        useNativeDriver: false,
      }).start();
    }
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

  const renderStageCard = (stage, label) => {
    const isExpanded = expandedStage === stage;
    const isEditing = editingStage === stage;
    const settings = schoolTimes[stage] || {};
    
    // Get stage-specific design
    const stageDesign = getStageDesign(stage);

    return (
      <View 
        style={[
          styles.stageCard, 
          isExpanded && styles.expandedCard,
          { borderLeftColor: stageDesign.primaryColor }
        ]} 
        key={stage}
      >
        <TouchableOpacity 
          style={styles.stageHeader} 
          onPress={() => handleExpand(stage)}
          activeOpacity={0.7}
        >
          <View style={styles.stageInfo}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: stageDesign.primaryColor }
            ]}>
              <FontAwesome5 
                name={stageDesign.icon} 
                size={18} 
                color={COLORS.text.inverse} 
                solid 
              />
            </View>
            <Text style={styles.stageLabel}>{label}</Text>
          </View>
          <View style={styles.indicator}>
            {(settings.startTime && settings.endTime) ? (
              <View style={styles.configuredBadge}>
                <Text style={styles.configuredText}>Configured</Text>
              </View>
            ) : (
              <View style={styles.notConfiguredBadge}>
                <Text style={styles.notConfiguredText}>Not Set</Text>
              </View>
            )}
            <FontAwesome5 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={COLORS.text.secondary}
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && !isEditing && (
          <View style={styles.stageDetails}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Daily Schedule</Text>
              <View style={styles.timeDetail}>
                <FontAwesome5 
                  name="clock" 
                  size={14} 
                  color={COLORS.text.tertiary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Start:</Text>
                <Text style={styles.detailValue}>
                  {settings.startTime || 'Not set'}
                </Text>
              </View>
              <View style={styles.timeDetail}>
                <FontAwesome5 
                  name="clock" 
                  size={14} 
                  color={COLORS.text.tertiary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>End:</Text>
                <Text style={styles.detailValue}>
                  {settings.endTime || 'Not set'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Academic Year</Text>
              <View style={styles.timeDetail}>
                <FontAwesome5 
                  name="calendar-alt" 
                  size={14} 
                  color={COLORS.text.tertiary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>Start:</Text>
                <Text style={styles.detailValue}>
                  {settings.yearStart || 'Not set'}
                </Text>
              </View>
              <View style={styles.timeDetail}>
                <FontAwesome5 
                  name="calendar-alt" 
                  size={14} 
                  color={COLORS.text.tertiary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailLabel}>End:</Text>
                <Text style={styles.detailValue}>
                  {settings.yearEnd || 'Not set'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: stageDesign.primaryColor }]}
              onPress={() => handleEdit(stage)}
            >
              <FontAwesome5 
                name="edit" 
                size={14} 
                color={COLORS.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={styles.editButtonText}>Edit Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {isExpanded && isEditing && (
          <View style={styles.editForm}>
            <Text style={styles.formSectionTitle}>Daily Schedule</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8:30 AM"
                value={tempSettings.startTime}
                onChangeText={(text) => setTempSettings(prev => ({ ...prev, startTime: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3:30 PM"
                value={tempSettings.endTime}
                onChangeText={(text) => setTempSettings(prev => ({ ...prev, endTime: text }))}
              />
            </View>
            
            <Text style={styles.formSectionTitle}>Academic Year</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year Start</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                value={tempSettings.yearStart}
                onChangeText={(text) => setTempSettings(prev => ({ ...prev, yearStart: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year End</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                value={tempSettings.yearEnd}
                onChangeText={(text) => setTempSettings(prev => ({ ...prev, yearEnd: text }))}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditingStage(null)}
              >
                <FontAwesome5 
                  name="times" 
                  size={14} 
                  color={COLORS.text.inverse}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={() => handleSave(stage)}
              >
                <FontAwesome5 
                  name="save" 
                  size={14} 
                  color={COLORS.text.inverse}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
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
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your school schedule</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 
              name="school" 
              size={18} 
              color={COLORS.primary.main}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>School Hours</Text>
          </View>
          
          {renderStageCard('elementary', 'Elementary School')}
          {renderStageCard('middle', 'Middle School')}
          {renderStageCard('high', 'High School')}
          {renderStageCard('college', 'College')}
        </View>
        
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>School Timer v1.0.0</Text>
          <Text style={styles.appDescription}>
            Track your school day progress across all education levels
          </Text>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    marginRight: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  stageCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  expandedCard: {
    ...SHADOWS.md,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stageLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configuredBadge: {
    backgroundColor: COLORS.success + '20',
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  configuredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  notConfiguredBadge: {
    backgroundColor: COLORS.neutral[200],
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  notConfiguredText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.text.tertiary,
  },
  chevron: {
    marginLeft: SPACING.xs,
  },
  stageDetails: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  detailsSection: {
    marginBottom: SPACING.md,
  },
  timeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailIcon: {
    width: 20,
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    width: 45,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  editButtonText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  editForm: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  formSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  cancelButton: {
    backgroundColor: COLORS.neutral[500],
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  appInfo: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginBottom: SPACING.xs,
  },
  appDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});