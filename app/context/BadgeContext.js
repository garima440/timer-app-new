import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSchoolTimes } from './SchoolTimeContext';

// Storage key for badges
const BADGE_STORAGE_KEY = 'SCHOOL_TIMER_BADGES';

// Define all available badges
const BADGES = [
  {
    id: 'first_day',
    name: 'First Day Complete',
    description: 'Complete your first school day',
    icon: '🏅',
    type: 'milestone'
  },
  {
    id: 'three_day_streak',
    name: 'On a Roll',
    description: 'Complete school 3 days in a row',
    icon: '🔥',
    type: 'streak'
  },
  {
    id: 'week_complete',
    name: 'Week Champion',
    description: 'Complete a full school week',
    icon: '🏆',
    type: 'milestone'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Start 5 school days before the bell',
    icon: '🐦',
    type: 'habit',
    progress: 0,
    target: 5
  },
  {
    id: 'schedule_master',
    name: 'Schedule Master',
    description: 'Add 10 items to your schedule',
    icon: '📝',
    type: 'activity',
    progress: 0,
    target: 10
  },
  {
    id: 'perfect_month',
    name: 'Monthly Master',
    description: 'Complete all school days in a month',
    icon: '⭐️',
    type: 'milestone'
  }
];

// Create the context
const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
  const [badges, setBadges] = useState([]);
  const [dayStreak, setDayStreak] = useState(0);
  const [lastCompletedDay, setLastCompletedDay] = useState(null);
  const [recentlyEarnedBadge, setRecentlyEarnedBadge] = useState(null);
  
  // We can't use the hook here directly, but we'll handle this in component logic
  // to avoid the "must be used within a provider" error
  
  // Load badges from storage
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const storedBadges = await AsyncStorage.getItem(BADGE_STORAGE_KEY);
        if (storedBadges) {
          const { badges, streak, lastDay } = JSON.parse(storedBadges);
          setBadges(badges);
          setDayStreak(streak || 0);
          setLastCompletedDay(lastDay || null);
        } else {
          // Initialize with default badges (all unlocked = false)
          const initialBadges = BADGES.map(badge => ({
            ...badge,
            earned: false,
            earnedDate: null,
            progress: badge.progress || 0
          }));
          setBadges(initialBadges);
          await saveBadges(initialBadges, 0, null);
        }
      } catch (error) {
        console.error('Error loading badges:', error);
      }
    };

    loadBadges();
  }, []);

  // Save badges to storage
  const saveBadges = async (badgeData, streak, lastDay) => {
    try {
      const data = {
        badges: badgeData,
        streak: streak,
        lastDay: lastDay
      };
      await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  };

  // Check and update streak based on current date
  const updateStreak = (completedToday = false) => {
    const today = new Date().toDateString();
    
    if (completedToday) {
      // If already completed today, don't update
      if (lastCompletedDay === today) return;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      // Check if last completion was yesterday to maintain streak
      let newStreak = dayStreak;
      if (lastCompletedDay === yesterdayString) {
        newStreak = dayStreak + 1;
      } else if (lastCompletedDay !== today) {
        // If not yesterday and not today, start new streak
        newStreak = 1;
      }
      
      setDayStreak(newStreak);
      setLastCompletedDay(today);
      
      // Save updated streak data
      saveBadges(badges, newStreak, today);
      
      // Check for streak badges
      checkForStreakBadges(newStreak);
    }
  };

  // Check if user earned any streak-related badges
  const checkForStreakBadges = (streakCount) => {
    const updatedBadges = [...badges];
    let newBadgeEarned = false;
    
    // Check for 3-day streak badge
    const threeDayBadge = updatedBadges.find(b => b.id === 'three_day_streak');
    if (threeDayBadge && !threeDayBadge.earned && streakCount >= 3) {
      threeDayBadge.earned = true;
      threeDayBadge.earnedDate = new Date().toISOString();
      newBadgeEarned = threeDayBadge;
    }
    
    // Check for week complete badge
    const weekBadge = updatedBadges.find(b => b.id === 'week_complete');
    if (weekBadge && !weekBadge.earned && streakCount >= 5) {
      weekBadge.earned = true;
      weekBadge.earnedDate = new Date().toISOString();
      newBadgeEarned = weekBadge;
    }
    
    if (newBadgeEarned) {
      setBadges(updatedBadges);
      saveBadges(updatedBadges, streakCount, lastCompletedDay);
      setRecentlyEarnedBadge(newBadgeEarned);
    }
  };

  // Mark a day as completed (call this when progress reaches 100%)
  const markDayComplete = (stage) => {
    updateStreak(true);
    
    // Check for first day badge
    const updatedBadges = [...badges];
    const firstDayBadge = updatedBadges.find(b => b.id === 'first_day');
    
    if (firstDayBadge && !firstDayBadge.earned) {
      firstDayBadge.earned = true;
      firstDayBadge.earnedDate = new Date().toISOString();
      setBadges(updatedBadges);
      saveBadges(updatedBadges, dayStreak, lastCompletedDay);
      setRecentlyEarnedBadge(firstDayBadge);
    }
  };

  // Increment progress for specific activity badges
  const updateActivityProgress = (activityType, increment = 1) => {
    const updatedBadges = [...badges];
    let newBadgeEarned = null;
    
    if (activityType === 'schedule_item_added') {
      const scheduleBadge = updatedBadges.find(b => b.id === 'schedule_master');
      if (scheduleBadge && !scheduleBadge.earned) {
        scheduleBadge.progress += increment;
        
        if (scheduleBadge.progress >= scheduleBadge.target) {
          scheduleBadge.earned = true;
          scheduleBadge.earnedDate = new Date().toISOString();
          newBadgeEarned = scheduleBadge;
        }
      }
    }
    
    if (activityType === 'early_arrival') {
      const earlyBirdBadge = updatedBadges.find(b => b.id === 'early_bird');
      if (earlyBirdBadge && !earlyBirdBadge.earned) {
        earlyBirdBadge.progress += increment;
        
        if (earlyBirdBadge.progress >= earlyBirdBadge.target) {
          earlyBirdBadge.earned = true;
          earlyBirdBadge.earnedDate = new Date().toISOString();
          newBadgeEarned = earlyBirdBadge;
        }
      }
    }
    
    if (newBadgeEarned) {
      setRecentlyEarnedBadge(newBadgeEarned);
    }
    
    setBadges(updatedBadges);
    saveBadges(updatedBadges, dayStreak, lastCompletedDay);
  };

  // Clear the recently earned badge notification
  const clearRecentBadge = () => {
    setRecentlyEarnedBadge(null);
  };

  return (
    <BadgeContext.Provider
      value={{
        badges,
        dayStreak,
        recentlyEarnedBadge,
        markDayComplete,
        updateActivityProgress,
        clearRecentBadge
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadges = () => useContext(BadgeContext);