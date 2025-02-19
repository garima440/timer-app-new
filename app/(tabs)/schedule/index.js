// app/(tabs)/schedule/index.js
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

const timeViews = {
  elementary: [
    { id: 'day', name: 'Day View', icon: 'clock-o', description: 'Class by class schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-o', description: 'Weekly class routine' },
    { id: 'quarter', name: 'Quarter View', icon: 'calendar', description: '9-week periods' },
  ],
  middle: [
    { id: 'day', name: 'Day View', icon: 'clock-o', description: 'Period by period' },
    { id: 'week', name: 'Week View', icon: 'calendar-o', description: 'Weekly schedule' },
    { id: 'trimester', name: 'Trimester View', icon: 'calendar', description: '12-week periods' },
  ],
  high: [
    { id: 'day', name: 'Day View', icon: 'clock-o', description: 'Block/period schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-o', description: 'Weekly schedule' },
    { id: 'semester', name: 'Semester View', icon: 'calendar', description: '18-week periods' },
  ],
  college: [
    { id: 'day', name: 'Day View', icon: 'clock-o', description: 'Class schedule' },
    { id: 'week', name: 'Week View', icon: 'calendar-o', description: 'Weekly schedule' },
    { id: 'semester', name: 'Semester View', icon: 'calendar', description: '15-16 week periods' },
  ],
};

export default function Schedule() {
  const { stage } = useLocalSearchParams();
  const router = useRouter();
  const [selectedView, setSelectedView] = useState(null);

  const views = timeViews[stage] || timeViews.elementary;

  const handleViewSelect = (view) => {
    setSelectedView(view);
    router.push(`/schedule/${view.id}?stage=${stage}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Choose Your View</Text>
      
      <View style={styles.viewGrid}>
        {views.map((view) => (
          <TouchableOpacity
            key={view.id}
            style={[
              styles.viewCard,
              selectedView?.id === view.id && styles.selectedCard
            ]}
            onPress={() => handleViewSelect(view)}
          >
            <View style={styles.viewHeader}>
              <FontAwesome name={view.icon} size={24} color="#4b5563" />
              <Text style={styles.viewName}>{view.name}</Text>
            </View>
            <Text style={styles.viewDescription}>{view.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
  viewGrid: {
    padding: 16,
    gap: 16,
  },
  viewCard: {
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
  viewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  viewName: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});