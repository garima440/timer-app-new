import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '../utils/helpers';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, getStageDesign } from '../theme';

export const TimelineView = ({ events, stage = 'high', onEventPress }) => {
  // Get stage-specific design
  const stageDesign = getStageDesign(stage);
  
  // Group events by time
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  
  // Helper to determine event status
  const getEventStatus = (event) => {
    const eventTime = typeof event.time === 'string' 
      ? parseInt(event.time.split(':')[0]) * 60 + parseInt(event.time.split(':')[1])
      : event.time;
    
    if (event.endTime) {
      const endTime = typeof event.endTime === 'string'
        ? parseInt(event.endTime.split(':')[0]) * 60 + parseInt(event.endTime.split(':')[1])
        : event.endTime;
      
      if (currentTime >= eventTime && currentTime < endTime) {
        return 'current';
      } else if (currentTime >= endTime) {
        return 'past';
      }
    } else {
      // If no endTime, just check if this event's start time is in the past
      if (currentTime >= eventTime) {
        return 'past';
      }
    }
    
    return 'upcoming';
  };

  // If no events, show empty state
  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="calendar-alt" size={40} color={COLORS.neutral[300]} />
        <Text style={styles.emptyText}>No events scheduled</Text>
        <Text style={styles.emptySubtext}>Your timeline will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>
      
      {events.map((event, index) => {
        const eventStatus = getEventStatus(event);
        const isLast = index === events.length - 1;
        
        return (
          <TouchableOpacity 
            key={index} 
            style={styles.eventContainer}
            onPress={() => onEventPress && onEventPress(event)}
            activeOpacity={0.8}
          >
            <View style={styles.timeColumn}>
              <View style={[
                styles.timeIndicator,
                eventStatus === 'current' && styles.currentTimeIndicator,
                eventStatus === 'past' && styles.pastTimeIndicator,
                { backgroundColor: eventStatus === 'current' ? stageDesign.primaryColor : COLORS.background.primary }
              ]}>
                <Text style={[
                  styles.timeText,
                  eventStatus === 'current' && styles.currentTimeText,
                  eventStatus === 'past' && styles.pastTimeText
                ]}>
                  {formatTime(event.time)}
                </Text>
              </View>
              
              {!isLast && (
                <View style={[
                  styles.timeLine,
                  eventStatus === 'past' && styles.pastTimeLine
                ]} />
              )}
            </View>
            
            <View style={[
              styles.eventContent,
              eventStatus === 'current' && [styles.currentEventContent, { borderColor: stageDesign.primaryColor }],
              eventStatus === 'past' && styles.pastEventContent
            ]}>
              <View style={styles.eventHeader}>
                <Text style={[
                  styles.eventTitle,
                  eventStatus === 'past' && styles.pastEventTitle
                ]}>
                  {event.subject}
                </Text>
                
                {eventStatus === 'current' && (
                  <View style={[styles.statusIndicator, { backgroundColor: stageDesign.primaryColor }]}>
                    <Text style={styles.statusText}>NOW</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.eventDetails}>
                {event.location && (
                  <View style={styles.detailRow}>
                    <FontAwesome5 
                      name="map-marker-alt" 
                      size={12} 
                      color={eventStatus === 'past' ? COLORS.neutral[400] : COLORS.neutral[500]} 
                      style={styles.detailIcon} 
                    />
                    <Text style={[
                      styles.eventLocation,
                      eventStatus === 'past' && styles.pastEventDetail
                    ]}>
                      {event.location}
                    </Text>
                  </View>
                )}
                
                {event.duration && (
                  <View style={styles.detailRow}>
                    <FontAwesome5 
                      name="clock" 
                      size={12} 
                      color={eventStatus === 'past' ? COLORS.neutral[400] : COLORS.neutral[500]} 
                      style={styles.detailIcon} 
                    />
                    <Text style={[
                      styles.eventDuration,
                      eventStatus === 'past' && styles.pastEventDetail
                    ]}>
                      {event.duration} mins
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
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
  eventContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
  },
  timeIndicator: {
    width: 70,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xs,
    zIndex: 1,
  },
  currentTimeIndicator: {
    ...SHADOWS.sm,
  },
  pastTimeIndicator: {
    backgroundColor: COLORS.neutral[100],
    ...SHADOWS.xs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  currentTimeText: {
    color: COLORS.text.inverse,
  },
  pastTimeText: {
    color: COLORS.text.tertiary,
  },
  timeLine: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.neutral[200],
    marginTop: SPACING.xs,
    position: 'absolute',
    top: 30,
    bottom: 0,
  },
  pastTimeLine: {
    backgroundColor: COLORS.neutral[200],
  },
  eventContent: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginLeft: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...SHADOWS.sm,
  },
  currentEventContent: {
    borderLeftWidth: 3,
    ...SHADOWS.md,
  },
  pastEventContent: {
    backgroundColor: COLORS.neutral[100],
    ...SHADOWS.xs,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  pastEventTitle: {
    color: COLORS.text.tertiary,
  },
  statusIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.xs,
    marginLeft: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  eventDetails: {
    marginTop: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs / 2,
  },
  detailIcon: {
    marginRight: SPACING.xs,
    width: 14,
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  eventDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  pastEventDetail: {
    color: COLORS.text.tertiary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  }
});

export default TimelineView;