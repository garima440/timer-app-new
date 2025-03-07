import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, getStageDesign } from '../theme';

export const StageSelector = ({ stages, selectedStage, onSelect }) => {
  // Function to render badge if there are notifications
  const renderBadge = (stage) => {
    if (stage.notifications && stage.notifications > 0) {
      return (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>
            {stage.notifications > 9 ? '9+' : stage.notifications}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Education Level</Text>
      
      <View style={styles.stagesList}>
        {stages.map((stage) => {
          const stageDesign = getStageDesign(stage.id);
          const isSelected = selectedStage?.id === stage.id;
          
          return (
            <TouchableOpacity
              key={stage.id}
              style={[
                styles.stageCard,
                isSelected && [styles.selectedCard, { borderColor: stageDesign.primaryColor }],
              ]}
              onPress={() => onSelect(stage)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconContainer,
                isSelected && { backgroundColor: stageDesign.primaryColor },
              ]}>
                <FontAwesome5 
                  name={stageDesign.icon} 
                  size={24} 
                  color={isSelected ? COLORS.text.inverse : stageDesign.primaryColor} 
                />
                {renderBadge(stage)}
              </View>
              
              <View style={styles.stageInfo}>
                <Text style={styles.stageName}>{stage.name}</Text>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <FontAwesome5 
                      name="user-graduate" 
                      size={12} 
                      color={COLORS.text.tertiary} 
                      style={styles.detailIcon} 
                    />
                    <Text style={styles.stageDetails}>Grades: {stage.grades}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <FontAwesome5 
                      name="birthday-cake" 
                      size={12} 
                      color={COLORS.text.tertiary} 
                      style={styles.detailIcon} 
                    />
                    <Text style={styles.stageDetails}>Ages: {stage.typical_age}</Text>
                  </View>
                </View>
              </View>
              
              {isSelected && (
                <View style={styles.checkmark}>
                  <FontAwesome5 
                    name="check-circle" 
                    size={20} 
                    color={stageDesign.primaryColor} 
                    solid 
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  stagesList: {
    gap: SPACING.md,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background.primary,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    ...SHADOWS.sm,
  },
  selectedCard: {
    backgroundColor: COLORS.background.secondary,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  notificationText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  detailsContainer: {
    gap: SPACING.xs / 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: SPACING.xs,
    width: 14,
    textAlign: 'center',
  },
  stageDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  checkmark: {
    marginLeft: SPACING.md,
  }
});

export default StageSelector;