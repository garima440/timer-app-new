import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { useBadges } from '../../context/BadgeContext';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Badge categories
const CATEGORIES = [
  { id: 'all', name: 'All Badges' },
  { id: 'milestone', name: 'Achievements' },
  { id: 'streak', name: 'Streaks' },
  { id: 'activity', name: 'Activities' },
  { id: 'habit', name: 'Habits' }
];

// Educational stages
const STAGES = [
  { id: 'all', name: 'All Stages' },
  { id: 'elementary', name: 'Elementary' },
  { id: 'middle', name: 'Middle School' },
  { id: 'high', name: 'High School' },
  { id: 'college', name: 'College' }
];

export default function BadgesScreen() {
  const { badges, dayStreak, weekStreak } = useBadges();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  
  // Filter badges based on selected category and stage
  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.type === selectedCategory;
    const stageMatch = selectedStage === 'all' || badge.stage === selectedStage || !badge.stage;
    return categoryMatch && stageMatch;
  });
  
  // Group badges by type for displaying in sections
  const badgesByType = filteredBadges.reduce((groups, badge) => {
    const group = groups[badge.type] || [];
    group.push(badge);
    groups[badge.type] = group;
    return groups;
  }, {});
  
  const renderBadge = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.badgeItem,
        item.earned ? styles.earnedBadge : styles.lockedBadge
      ]}
    >
      <Text style={styles.badgeIcon}>{item.icon}</Text>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, item.earned ? styles.earnedText : styles.lockedText]}>
          {item.name}
        </Text>
        <Text style={styles.badgeDescription}>{item.description}</Text>
        
        {item.stage && (
          <View style={styles.stageTag}>
            <Text style={styles.stageText}>{
              item.stage === 'elementary' ? 'Elementary' :
              item.stage === 'middle' ? 'Middle School' :
              item.stage === 'high' ? 'High School' :
              item.stage === 'college' ? 'College' : ''
            }</Text>
          </View>
        )}
        
        {!item.earned && item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${(item.progress / item.target) * 100}%` }
              ]}
            />
            <Text style={styles.progressText}>
              {item.progress} / {item.target}
            </Text>
          </View>
        )}
        
        {item.earned && item.earnedDate && (
          <Text style={styles.earnedDate}>
            Earned on {new Date(item.earnedDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header with streak info */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{dayStreak} day streak</Text>
          </View>
          
          <View style={styles.streakDivider} />
          
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>📅</Text>
            <Text style={styles.streakText}>{weekStreak} week streak</Text>
          </View>
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
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
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
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
          {STAGES.map(stage => (
            <TouchableOpacity
              key={stage.id}
              style={[
                styles.stageButton,
                selectedStage === stage.id && styles.stageButtonActive
              ]}
              onPress={() => setSelectedStage(stage.id)}
            >
              <Text 
                style={[
                  styles.stageButtonText,
                  selectedStage === stage.id && styles.stageButtonTextActive
                ]}
              >
                {stage.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Badge List */}
      <ScrollView style={styles.badgeList}>
        {Object.entries(badgesByType).length > 0 ? (
          Object.entries(badgesByType).map(([type, badgeList]) => (
            <View key={type} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {type === 'milestone' ? 'Achievements' :
                 type === 'streak' ? 'Streaks' :
                 type === 'activity' ? 'Activities' :
                 type === 'habit' ? 'Habits' :
                 type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <FlatList
                data={badgeList}
                renderItem={renderBadge}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="trophy" size={64} color="#e5e7eb" />
            <Text style={styles.emptyText}>No badges in this category yet</Text>
            <Text style={styles.emptySubtext}>Complete activities to earn badges</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 16,
    justifyContent: 'center',
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  streakDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  streakIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  streakText: {
    fontWeight: '600',
    color: '#4b5563',
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stageFilters: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryButtonText: {
    fontWeight: '500',
    color: '#4b5563',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  stageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  stageButtonActive: {
    backgroundColor: '#10b981',
  },
  stageButtonText: {
    fontWeight: '500',
    color: '#6b7280',
    fontSize: 12,
  },
  stageButtonTextActive: {
    color: '#fff',
  },
  badgeList: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4b5563',
  },
  badgeItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  earnedBadge: {
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  earnedText: {
    color: '#10b981',
  },
  lockedText: {
    color: '#4b5563',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stageTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  stageText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 8,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 8,
    fontSize: 10,
    color: '#6b7280',
  },
  earnedDate: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  }
});