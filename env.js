// env.js
import Constants from 'expo-constants';

// In production, these will come from app.config.js
// For development, you can hardcode values temporarily
const FACEPP_API_KEY = Constants?.expoConfig?.extra?.faceppApiKey || 'YOUR_DEV_API_KEY';
const FACEPP_API_SECRET = Constants?.expoConfig?.extra?.faceppApiSecret || 'YOUR_DEV_API_SECRET';

export { FACEPP_API_KEY, FACEPP_API_SECRET };