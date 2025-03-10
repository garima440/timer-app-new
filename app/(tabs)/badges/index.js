import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Image,
  StatusBar,
  SectionList
} from 'react-native';
import { useBadges } from '../../context/BadgeContext';
import { useStage } from '../../context/StageContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS,
  getStageDesign,
} from '../../theme';

// Badge categories
const CATEGORIES = [
  { id: 'all', name: 'All Badges', icon: 'layer-group' },
  { id: 'milestone', name: 'Achievements', icon: 'trophy' },
  { id: 'streak', name: 'Streaks', icon: 'fire' },
  { id: 'activity', name: 'Activities', icon: 'tasks' },
  { id: 'habit', name: 'Habits', icon: 'calendar-check' }
];

// Educational stages
const STAGES = [
  { id: 'all', name: 'All Stages', icon: 'graduation-cap' },
  { id: 'elementary', name: 'Elementary', icon: 'child' },
  { id: 'middle', name: 'Middle School', icon: 'book' },
  { id: 'high', name: 'High School', icon: 'graduation-cap' },
  { id: 'college', name: 'College', icon: 'university' }
];

export default function BadgesScreen() {
  const { badges, dayStreak, weekStreak } = useBadges();
  const { selectedStage: userSelectedStage } = useStage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState(userSelectedStage || 'all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [badgeSections, setBadgeSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const streakAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate streak counter on mount
    Animated.timing(streakAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
    
    // Process and group badges
    processBadges();
  }, [badges, selectedCategory, selectedStage]);
  
  // Process badges for display
  const processBadges = () => {
    setLoading(true);
    
    // Filter badges based on selected category and stage
    const filteredBadges = badges.filter(badge => {
      const categoryMatch = selectedCategory === 'all' || badge.type === selectedCategory;
      const stageMatch = selectedStage === 'all' || badge.stage === selectedStage || !badge.stage;
      return categoryMatch && stageMatch;
    });
    
    // Group badges by type for section list
    const groupedBadges = filteredBadges.reduce((groups, badge) => {
      const type = badge.type;
      const group = groups[type] || [];
      group.push(badge);
      groups[type] = group;
      return groups;
    }, {});
    
    // Convert to format needed for SectionList
    const sections = Object.entries(groupedBadges).map(([type, items]) => ({
      title: formatSectionTitle(type),
      data: items,
      type
    }));
    
    // Sort sections alphabetically
    sections.sort((a, b) => a.title.localeCompare(b.title));
    
    // Sort badges within each section (earned first, then by progress)
    sections.forEach(section => {
      section.data.sort((a, b) => {
        // First by earned status
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        
        // Then by progress percentage if not earned
        if (!a.earned && !b.earned) {
          const aProgress = (a.progress / a.target) || 0;
          const bProgress = (b.progress / b.target) || 0;
          return bProgress - aProgress;
        }
        
        // Sort earned badges by earned date (newest first)
        if (a.earned && b.earned) {
          return new Date(b.earnedDate) - new Date(a.earnedDate);
        }
        
        return 0;
      });
    });
    
    setBadgeSections(sections);
    setLoading(false);
  };
  
  const formatSectionTitle = (type) => {
    switch(type) {
      case 'milestone': return 'Achievements';
      case 'streak': return 'Streaks';
      case 'activity': return 'Activities';
      case 'habit': return 'Habits';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getBadgeTypeIcon = (type) => {
    switch(type) {
      case 'milestone': return 'trophy';
      case 'streak': return 'fire';
      case 'activity': return 'tasks';
      case 'habit': return 'calendar-check';
      default: return 'award';
    }
  };
  
  const getStageColor = (stageId) => {
    if (!stageId) return COLORS.primary.main;
    return getStageDesign(stageId).primaryColor;
  };
  
  const renderBadge = ({ item }) => {
    const badgeStageColor = getStageColor(item.stage);
    const progressPercentage = item.target ? Math.min(100, (item.progress / item.target) * 100) : 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.badgeItem,
          item.earned 
            ? [styles.earnedBadge, { borderLeftColor: badgeStageColor }] 
            : styles.lockedBadge
        ]}
        activeOpacity={0.8}
      >
        <View style={[
          styles.badgeIconContainer,
          { backgroundColor: item.earned ? badgeStageColor + '20' : COLORS.neutral[100] }
        ]}>
          <Text style={styles.badgeIcon}>{item.icon}</Text>
          {item.earned && (
            <View style={[styles.earnedIconOverlay, { backgroundColor: badgeStageColor }]}>
              <FontAwesome5 name="check" size={10} color={COLORS.text.inverse} />
            </View>
          )}
        </View>
        
        <View style={styles.badgeInfo}>
          <Text style={[
            styles.badgeName,
            item.earned ? { color: badgeStageColor } : styles.lockedText
          ]}>
            {item.name}
          </Text>
          <Text style={styles.badgeDescription}>{item.description}</Text>
          
          {item.stage && (
            <View style={[
              styles.stageTag,
              { backgroundColor: getStageColor(item.stage) + '15' }
            ]}>
              <FontAwesome5 
                name={STAGES.find(s => s.id === item.stage)?.icon || 'graduation-cap'} 
                size={10} 
                color={getStageColor(item.stage)}
                style={styles.stageIcon}
              />
              <Text style={[styles.stageText, { color: getStageColor(item.stage) }]}>
                {STAGES.find(s => s.id === item.stage)?.name || item.stage}
              </Text>
            </View>
          )}
          
          {!item.earned && item.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progressPercentage}%`, backgroundColor: badgeStageColor }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress} / {item.target}
              </Text>
            </View>
          )}
          
          {item.earned && item.earnedDate && (
            <Text style={styles.earnedDate}>
              <FontAwesome5 name="calendar-alt" size={10} color={COLORS.text.tertiary} />
              {' '}Earned on {new Date(item.earnedDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <FontAwesome5 
          name={getBadgeTypeIcon(section.type)} 
          size={16} 
          color={COLORS.primary.main}
          style={styles.sectionIcon}
        />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.badgeCount}>{section.data.length}</Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <View style={styles.container}>
        {/* Header with streak info */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          
          <Animated.View 
            style={[
              styles.streakContainer,
              { opacity: streakAnimation, transform: [{ scale: streakAnimation }] }
            ]}
          >
            <View style={styles.streakItem}>
              <View style={[styles.streakIconContainer, { backgroundColor: COLORS.warning }]}>
                <FontAwesome5 name="fire" size={16} color={COLORS.text.inverse} />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{dayStreak}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
            
            <View style={styles.streakDivider} />
            
            <View style={styles.streakItem}>
              <View style={[styles.streakIconContainer, { backgroundColor: COLORS.success }]}>
                <FontAwesome5 name="calendar-week" size={16} color={COLORS.text.inverse} />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{weekStreak}</Text>
                <Text style={styles.streakLabel}>Week Streak</Text>
              </View>
            </View>
          </Animated.View>
        </View>
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* View Mode Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'list' && styles.activeViewToggle,
                { borderTopLeftRadius: BORDER_RADIUS.md, borderBottomLeftRadius: BORDER_RADIUS.md }
              ]}
              onPress={() => setViewMode('list')}
            >
              <FontAwesome5 
                name="list" 
                size={14} 
                color={viewMode === 'list' ? COLORS.text.inverse : COLORS.text.secondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'grid' && styles.activeViewToggle,
                { borderTopRightRadius: BORDER_RADIUS.md, borderBottomRightRadius: BORDER_RADIUS.md }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <FontAwesome5 
                name="th-large" 
                size={14} 
                color={viewMode === 'grid' ? COLORS.text.inverse : COLORS.text.secondary} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilters}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && [
                    styles.categoryButtonActive,
                    { backgroundColor: COLORS.primary.main }
                  ]
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <FontAwesome5 
                  name={category.icon} 
                  size={14} 
                  color={selectedCategory === category.id ? COLORS.text.inverse : COLORS.text.secondary}
                  style={styles.categoryIcon} 
                />
                <Text 
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Stage Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stageFilters}
          >
            {STAGES.map(stage => {
              const stageDesign = getStageDesign(stage.id !== 'all' ? stage.id : 'high');
              const isActive = selectedStage === stage.id;
              
              return (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.stageButton,
                    isActive && [
                      styles.stageButtonActive,
                      { backgroundColor: stage.id === 'all' ? COLORS.primary.main : stageDesign.primaryColor }
                    ]
                  ]}
                  onPress={() => setSelectedStage(stage.id)}
                >
                  <FontAwesome5 
                    name={stage.icon} 
                    size={12} 
                    color={isActive ? COLORS.text.inverse : COLORS.text.secondary}
                    style={styles.stageButtonIcon} 
                  />
                  <Text 
                    style={[
                      styles.stageButtonText,
                      isActive && styles.stageButtonTextActive
                    ]}
                  >
                    {stage.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Badge List */}
        {viewMode === 'list' ? (
          <SectionList
            sections={badgeSections}
            renderItem={renderBadge}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.badgeListContent}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="trophy" size={64} color={COLORS.neutral[300]} />
                <Text style={styles.emptyText}>No badges in this category yet</Text>
                <Text style={styles.emptySubtext}>Complete activities to earn badges</Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={badges.filter(badge => {
              const categoryMatch = selectedCategory === 'all' || badge.type === selectedCategory;
              const stageMatch = selectedStage === 'all' || badge.stage === selectedStage || !badge.stage;
              return categoryMatch && stageMatch;
            })}
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <View style={[
                  styles.gridBadgeContainer,
                  item.earned ? 
                    { backgroundColor: getStageColor(item.stage) + '20', borderColor: getStageColor(item.stage) } :
                    { backgroundColor: COLORS.neutral[100], borderColor: COLORS.neutral[200] }
                ]}>
                  <Text style={styles.gridBadgeIcon}>{item.icon}</Text>
                  {item.earned && (
                    <View style={[
                      styles.gridEarnedBadge,
                      { backgroundColor: getStageColor(item.stage) }
                    ]}>
                      <FontAwesome5 name="check" size={10} color={COLORS.text.inverse} />
                    </View>
                  )}
                </View>
                <Text 
                  style={[
                    styles.gridBadgeName,
                    item.earned ? { color: getStageColor(item.stage) } : { color: COLORS.text.secondary }
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {!item.earned && item.progress !== undefined && (
                  <View style={styles.gridProgressBar}>
                    <View 
                      style={[
                        styles.gridProgressFill,
                        { width: `${(item.progress / item.target) * 100}%`, backgroundColor: getStageColor(item.stage) }
                      ]} 
                    />
                  </View>
                )}
              </View>
            )}
            numColumns={3}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="trophy" size={64} color={COLORS.neutral[300]} />
                <Text style={styles.emptyText}>No badges in this category yet</Text>
                <Text style={styles.emptySubtext}>Complete activities to earn badges</Text>
              </View>
            )}
          />
        )}
      </View>
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  streakIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.lineHeight.md,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
  },
  streakDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.neutral[300],
    marginHorizontal: SPACING.md,
  },
  filtersContainer: {
    backgroundColor: COLORS.background.primary,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  viewToggle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    overflow: 'hidden',
  },
  viewToggleButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  activeViewToggle: {
    backgroundColor: COLORS.primary.main,
  },
  categoryFilters: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.secondary,
    ...SHADOWS.xs,
  },
  categoryButtonActive: {
    ...SHADOWS.sm,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryButtonText: {
    fontWeight: '500',
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  categoryButtonTextActive: {
    color: COLORS.text.inverse,
  },
  stageFilters: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.secondary,
    ...SHADOWS.xs,
  },
  stageButtonActive: {
    ...SHADOWS.sm,
  },
  stageButtonIcon: {
    marginRight: SPACING.xs / 2,
  },
  stageButtonText: {
    fontWeight: '500',
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  stageButtonTextActive: {
    color: COLORS.text.inverse,
  },
  badgeListContent: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  badgeCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 4,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...SHADOWS.sm,
  },
  earnedBadge: {
    opacity: 1,
  },
  lockedBadge: {
    opacity: 0.8,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 24,
  },
  earnedIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  earnedText: {
    color: COLORS.success,
  },
  lockedText: {
    color: COLORS.text.secondary,
  },
  badgeDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 4,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stageIcon: {
    marginRight: SPACING.xs / 2,
  },
  stageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBackground: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.tertiary,
  },
  earnedDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  
  // Grid view styles
  gridContainer: {
    padding: SPACING.md,
  },
  gridItem: {
    flex: 1/3,
    aspectRatio: 0.9,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  gridBadgeContainer: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...SHADOWS.sm,
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  gridBadgeIcon: {
    fontSize: 32,
  },
  gridEarnedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  gridBadgeName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs / 2,
  },
  gridProgressBar: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.xs,
  },
  gridProgressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  }
});