export const SCHOOL_TIMES_KEY = 'schoolTimes';
export const SCHEDULE_KEY = 'scheduleData';

export const validateTime = (timeStr) => {
  if (!timeStr) return false;
  // Makes the regex case insensitive and handles optional space before AM/PM
  const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s*(AM|PM)$/i;
  return timeRegex.test(timeStr.trim());
};

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  const [time, period] = timeStr.trim().split(/\s+/);
  let [hours, minutes] = time.split(':').map(Number);
  
  // Handle invalid input
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  // Convert to 24-hour format
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

export const timeToSeconds = (timeStr) => {
  return timeToMinutes(timeStr) * 60;
};

export const formatTime = (seconds) => {
  if (seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  // For school day context, we might want a more human-readable format
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export default {
  validateTime,
  timeToMinutes,
  timeToSeconds,
  formatTime,
  SCHOOL_TIMES_KEY,
  SCHEDULE_KEY
};