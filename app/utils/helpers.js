// utils/helpers.js

// Time formatting
export const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Progress calculations
  export const calculateProgress = (current, total) => {
    return Math.round((current / total) * 100);
  };
  
  // Stage-specific colors
  export const getStageColor = (stage) => {
    const colors = {
      elementary: '#2563eb', // blue
      middle: '#7c3aed',     // purple
      high: '#059669',       // green
      college: '#dc2626',    // red
    };
    return colors[stage] || colors.elementary;
  };
  
  // Get current stage based on age
  export const getCurrentStage = (age) => {
    if (age < 11) return 'elementary';
    if (age < 14) return 'middle';
    if (age < 18) return 'high';
    return 'college';
  };
  
  // Get date in readable format
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get week number
  export const getWeekNumber = (date) => {
    const currentDate = new Date(date);
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  };
  
  // Get remaining time until date
  export const getTimeUntil = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const difference = target - now;
  
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
    return { days, hours, minutes };
  };
  
  // Grade calculation helper
  export const calculateGrade = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  // Get status color
  export const getStatusColor = (status) => {
    const colors = {
      completed: '#22c55e',  // green
      upcoming: '#eab308',   // yellow
      late: '#ef4444',       // red
      inProgress: '#3b82f6', // blue
    };
    return colors[status] || colors.upcoming;
  };
  
  // Validate email
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Format duration
  export const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  };
  
  const helpers = {
    formatTime,
    calculateProgress,
    getStageColor,
    getCurrentStage,
    formatDate,
    getWeekNumber,
    getTimeUntil,
    calculateGrade,
    getStatusColor,
    isValidEmail,
    formatDuration,
  };
  
  export default helpers;