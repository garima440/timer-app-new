// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "timer-app-new",
    slug: "timer-app-new",
    // Copy other settings from your app.json here
    extra: {
      faceppApiKey: process.env.FACEPP_API_KEY,
      faceppApiSecret: process.env.FACEPP_API_SECRET,
    },
    
    "android": {
        "package": "com.garima440.timerappnew"
    },

    "ios": {
        "bundleIdentifier": "com.garima440.timerappnew"
      },

    plugins: [
        "expo-barcode-scanner",
        [
          "expo-camera",
          {
            "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
          }
        ]
      ],
  }
};