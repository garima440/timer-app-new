// app/theme/index.js
import { Dimensions } from 'react-native';

// Device dimensions utility
const { width, height } = Dimensions.get('window');
export const SCREEN = { width, height };

// Base color palette
export const COLORS = {
  // Primary palette
  primary: {
    main: '#2563eb',     // Blue 600
    light: '#3b82f6',    // Blue 500
    dark: '#1d4ed8',     // Blue 700
    contrast: '#ffffff', // White for text on primary colors
  },
  
  // Education level accent colors
  education: {
    elementary: '#0ea5e9', // Sky blue - playful but professional
    middle: '#8b5cf6',     // Purple - transitional
    high: '#0891b2',       // Cyan - mature and focused
    college: '#1e40af',    // Deep blue - professional and serious
  },
  
  // Grayscale palette
  neutral: {
    50: '#f8fafc',  // Almost white
    100: '#f1f5f9', // Very light gray
    200: '#e2e8f0', // Light gray
    300: '#cbd5e1', // Gray
    400: '#94a3b8', // Medium gray
    500: '#64748b', // Medium-dark gray
    600: '#475569', // Dark gray
    700: '#334155', // Darker gray
    800: '#1e293b', // Very dark gray
    900: '#0f172a', // Almost black
  },
  
  // Semantic colors
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  error: '#ef4444',   // Red
  info: '#3b82f6',    // Blue
  
  // UI backgrounds
  background: {
    primary: '#ffffff',   // Main background
    secondary: '#f8fafc', // Secondary background
    tertiary: '#f1f5f9',  // Tertiary background
  },
  
  // Text colors
  text: {
    primary: '#0f172a',   // Primary text
    secondary: '#475569', // Secondary text
    tertiary: '#64748b',  // Tertiary text
    disabled: '#94a3b8',  // Disabled text
    inverse: '#ffffff',   // Inverse text (on dark backgrounds)
  },
};

// Typography scale
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14, 
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius scale
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999,
};

// Shadows
export const SHADOWS = {
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6.27,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8.16,
    elevation: 8,
  },
};

// Animation timing
export const ANIMATION = {
  fast: 200,
  medium: 300,
  slow: 500,
};

// Design tokens for education stages
export const EDUCATION_STAGE_DESIGN = {
  elementary: {
    primaryColor: COLORS.education.elementary,
    icon: 'child',
    progressBarColor: '#0ea5e9',
    shadowColor: '#0ea5e9',
  },
  middle: {
    primaryColor: COLORS.education.middle,
    icon: 'book',
    progressBarColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
  },
  high: {
    primaryColor: COLORS.education.high,
    icon: 'graduation-cap',
    progressBarColor: '#0891b2',
    shadowColor: '#0891b2',
  },
  college: {
    primaryColor: COLORS.education.college,
    icon: 'university',
    progressBarColor: '#1e40af',
    shadowColor: '#1e40af',
  },
};

// Helper function to get stage-specific design tokens
export const getStageDesign = (stageId) => {
  return EDUCATION_STAGE_DESIGN[stageId] || EDUCATION_STAGE_DESIGN.high;
};

// Get colors for light/dark mode
export const getThemeColors = (colorScheme = 'light') => {
  return {
    text: colorScheme === 'dark' ? '#ffffff' : COLORS.text.primary,
    background: colorScheme === 'dark' ? '#0f172a' : COLORS.background.primary,
    card: colorScheme === 'dark' ? '#1e293b' : COLORS.background.secondary,
    primary: COLORS.primary.main,
    border: colorScheme === 'dark' ? '#334155' : COLORS.neutral[200],
  };
};