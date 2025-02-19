import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/helpers';

export const TimelineView = ({ events }) => {
  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <View key={index} style={styles.eventContainer}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeText}>{formatTime(event.time)}</Text>
            <View style={styles.timeLine} />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.subject}</Text>
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  timeLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#e5e7eb',
    marginTop: 8,
  },
  eventContent: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default TimelineView;