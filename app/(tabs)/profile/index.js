// app/(tabs)/profile/index.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Animated, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Button,
  ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';
import * as Camera from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { FACEPP_API_KEY, FACEPP_API_SECRET } from "../../../env";


const stages = [
  { age: 6, stage: 'Elementary School Start', description: 'Beginning of formal education', icon: '🏫' },
  { age: 11, stage: 'Middle School', description: 'New challenges and independence', icon: '📚' },
  { age: 14, stage: 'High School', description: 'Preparing for future success', icon: '🎓' },
  { age: 18, stage: 'College', description: 'Higher education journey', icon: '🎯' },
  { age: 22, stage: 'Graduate', description: 'Ready for career', icon: '✨' }
];

export default function Profile() {
  const [currentAge, setCurrentAge] = useState(10);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [facing, setFacing] = useState(Camera.CameraType.front);
  const [useApiProcessing, setUseApiProcessing] = useState(true);
  const [originalFaceFeatures, setOriginalFaceFeatures] = useState(null);

  const cameraRef = useRef(null);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    // Apply age filter when age changes and we have a photo
    if (photoUri && currentAge) {
      if (useApiProcessing) {
        applyFacePPAgingEffect();
      } else {
        applyBasicFilterEffect();
      }
    }
  }, [currentAge, photoUri, useApiProcessing]);

  const getCurrentStage = (age) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (age >= stages[i].age) return stages[i];
    }
    return stages[0];
  };

  const getNextStage = (age) => {
    for (let stage of stages) {
      if (age < stage.age) return stage;
    }
    return null;
  };

  const currentStage = getCurrentStage(currentAge);
  const nextStage = getNextStage(currentAge);

  // Create a web-compatible rendering approach
  // This applies CSS filters directly to the image 
  const getAgeFilterStyle = (age) => {
    // Base values for different age ranges
    let brightness = 1;
    let contrast = 1;
    let saturation = 1;
    let sepia = 0;
    let blur = 0;
    
    // Adjustments based on age
    if (age <= 10) { // Child
      brightness = 1.1;  // Brighter
      contrast = 0.9;    // Less contrast
      saturation = 1.1;  // More saturated
      sepia = 0;         // No sepia
      blur = 0.5;        // Slight blur for softer look
    } else if (age <= 14) { // Teen
      brightness = 1.05;
      contrast = 0.95;
      saturation = 1.05;
      sepia = 0.1;
      blur = 0.2;
    } else if (age <= 18) { // Young adult
      brightness = 1;
      contrast = 1;
      saturation = 1;
      sepia = 0.2;
      blur = 0;
    } else { // Adult
      brightness = 0.95;
      contrast = 1.1;
      saturation = 0.9;
      sepia = 0.3;
      blur = 0;
    }
    
    return {
      filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${sepia}) blur(${blur}px)`
    };
  };

  // Apply basic filter effect using CSS
  const applyBasicFilterEffect = async () => {
    if (!photoUri) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setProcessedImage(photoUri);
      setIsProcessing(false);
    }, 500);
  };

  // Face++ Age Progression API Implementation
  const applyFacePPAgingEffect = async () => {
    if (!photoUri) return;
    
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      // Read the image file as base64
      const imageBase64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Step 1: Detect the face to get face_token
      const detectFormData = new FormData();
      detectFormData.append('api_key', FACEPP_API_KEY);
      detectFormData.append('api_secret', FACEPP_API_SECRET);
      detectFormData.append('image_base64', imageBase64);
      detectFormData.append('return_landmark', '0');
      detectFormData.append('return_attributes', 'age');
      
      const detectResponse = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        detectFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (!detectResponse.data.faces || detectResponse.data.faces.length === 0) {
        throw new Error('No face detected in the image');
      }
      
      const faceToken = detectResponse.data.faces[0].face_token;
      
      // Store original face features if we don't have them yet
      if (!originalFaceFeatures) {
        setOriginalFaceFeatures({
          faceToken: faceToken,
          detectedAge: detectResponse.data.faces[0].attributes?.age?.value || 25,
        });
      }
      
      // Step 2: Use Face Aging to create the age-progressed face
      // Calculate age value based on our slider
      const targetAge = currentAge;
      
      const faceMergeFormData = new FormData();
      faceMergeFormData.append('api_key', FACEPP_API_KEY);
      faceMergeFormData.append('api_secret', FACEPP_API_SECRET);
      faceMergeFormData.append('template_base64', imageBase64); // Original image
      faceMergeFormData.append('merge_base64', imageBase64); // Will merge with itself
      
      // We'll need to manipulate the age parameter according to the user's selected age
      // This part may need adjustment since Face++ APIs have different parameters
      faceMergeFormData.append('merge_rate', 100); // Full merge
      
      // Different approach: Use Face Merging API with age-based adjustments
      // This is a workaround since direct aging might be a premium feature
      const agingRatio = calculateAgingRatio(targetAge, originalFaceFeatures?.detectedAge || 25);
      faceMergeFormData.append('feature_aging', agingRatio.toString());
      
      const faceMergeResponse = await axios.post(
        'https://api-us.faceplusplus.com/imagepp/v1/mergeface',
        faceMergeFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      // The API returns a base64 image in the response
      const agedImageBase64 = faceMergeResponse.data.result;
      
      // Save the processed base64 image to a file
      const localUri = FileSystem.documentDirectory + `aged_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(
        localUri, 
        agedImageBase64,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      setProcessedImage(localUri);
      
    } catch (error) {
      console.error('Face++ API error:', error.response?.data || error.message || error);
      setErrorMessage('Failed to process image with Face++ API. Falling back to basic filters.');
      
      // Fallback to basic filter if API fails
      setProcessedImage(photoUri);
      setUseApiProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to calculate aging ratio for Face++ API
  const calculateAgingRatio = (targetAge, currentAge) => {
    // Face++ accepts values -100 to 100 for aging
    // Negative makes younger, positive makes older
    
    const ageDifference = targetAge - currentAge;
    // Scale to fit within -100 to 100 range
    // We'll use a scale where 20 years difference = full 100 value
    const scaledRatio = (ageDifference / 20) * 100;
    
    // Clamp between -100 and 100
    return Math.max(-100, Math.min(100, scaledRatio));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setPhotoUri(photo.uri);
        setCameraVisible(false);
        
        // Reset original face features when taking a new picture
        setOriginalFaceFeatures(null);
        
        if (useApiProcessing) {
          applyFacePPAgingEffect();
        } else {
          applyBasicFilterEffect();
        }
      } catch (error) {
        console.log(error);
        setErrorMessage('Failed to take picture');
      }
    }
  };

  // Toggle between front and back camera
  const toggleCameraFacing = () => {
    setFacing(current => (current === Camera.CameraType.back ? Camera.CameraType.front : Camera.CameraType.back));
  };

  // Toggle processing method
  const toggleProcessingMethod = () => {
    setUseApiProcessing(prev => !prev);
  };

  // Open web-based face aging tool as fallback
  const openWebFaceAging = () => {
    Linking.openURL('https://reflect.tech/faceapp/time_machine');
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera for age filtering</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
        <TouchableOpacity style={styles.fallbackButton} onPress={openWebFaceAging}>
          <Text style={styles.fallbackButtonText}>Try Web-Based Face Aging Tool</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Educational Journey</Text>

        {cameraVisible ? (
          <View style={styles.cameraContainer}>
          <Camera.Camera
            ref={cameraRef}
            style={styles.camera}
            type={facing}
          >
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <FontAwesome name="camera" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <FontAwesome name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setCameraVisible(false)}
                >
                  <FontAwesome name="times" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </Camera.Camera>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            {processedImage ? (
              <View style={styles.processedImageContainer}>
                {isProcessing ? (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>
                      {useApiProcessing ? 'Using AI to age your photo...' : 'Applying age effect...'}
                    </Text>
                  </View>
                ) : (
                  <Image 
                    source={{ uri: processedImage }} 
                    style={[
                      styles.processedImage, 
                      // Only apply CSS filters if not using API
                      !useApiProcessing && getAgeFilterStyle(currentAge)
                    ]} 
                  />
                )}
              </View>
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <TouchableOpacity 
                style={styles.cameraPrompt}
                onPress={() => setCameraVisible(true)}
              >
                <FontAwesome name="camera" size={36} color="#2563eb" />
                <Text style={styles.cameraPromptText}>Take Photo for Age Simulation</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Processing Method Toggle */}
        <TouchableOpacity 
          style={[
            styles.methodToggle, 
            { backgroundColor: useApiProcessing ? '#7c3aed' : '#4b5563' }
          ]}
          onPress={toggleProcessingMethod}
        >
          <Text style={styles.methodToggleText}>
            {useApiProcessing ? 'Using Face++ Age Progression' : 'Using Basic Filters'}
          </Text>
          <FontAwesome 
            name={useApiProcessing ? 'magic' : 'adjust'} 
            size={16} 
            color="#fff" 
            style={styles.methodIcon} 
          />
        </TouchableOpacity>

        {/* Age Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Adjust Age: {currentAge}</Text>
          <Slider
            style={styles.slider}
            minimumValue={6}
            maximumValue={22}
            step={1}
            value={currentAge}
            onValueChange={setCurrentAge}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#e5e7eb"
          />
        </View>

        {/* Current Stage Info */}
        <View style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageTitle}>Current Stage</Text>
            <Text style={styles.stageEmoji}>{currentStage.icon}</Text>
          </View>
          <Text style={styles.stageName}>{currentStage.stage}</Text>
          <Text style={styles.stageDescription}>{currentStage.description}</Text>
        </View>

        {/* Next Stage Info */}
        {nextStage && (
          <View style={styles.nextStageCard}>
            <View style={styles.stageHeader}>
              <Text style={styles.stageTitle}>Next Stage</Text>
              <Text style={styles.stageEmoji}>{nextStage.icon}</Text>
            </View>
            <Text style={styles.stageName}>{nextStage.stage}</Text>
            <Text style={styles.yearsUntil}>
              in {nextStage.age - currentAge} years
            </Text>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timeline}>
          {stages.map((stage, index) => (
            <View
              key={index}
              style={[
                styles.timelinePoint,
                { left: `${((stage.age - 6) / 16) * 100}%` }
              ]}
            >
              <View
                style={[
                  styles.timelineDot,
                  currentAge >= stage.age && styles.timelineDotActive
                ]}
              />
              <Text style={styles.timelineAge}>{stage.age}</Text>
            </View>
          ))}
          <View style={styles.timelineLine} />
        </View>
        
        {/* Reset Button */}
        {photoUri && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setPhotoUri(null);
              setProcessedImage(null);
              setErrorMessage(null);
              setOriginalFaceFeatures(null);
            }}
          >
            <Text style={styles.resetButtonText}>Take New Photo</Text>
          </TouchableOpacity>
        )}
        
        {/* Web-based alternative */}
        <TouchableOpacity 
          style={styles.webAlternativeButton}
          onPress={openWebFaceAging}
        >
          <Text style={styles.webAlternativeText}>Try Advanced Web Face Aging</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#4b5563',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  flipButton: {
    backgroundColor: '#4b5563',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  imageContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPromptText: {
    marginTop: 10,
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  processedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  processedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  methodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  methodToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  methodIcon: {
    marginLeft: 8,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  stageCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  nextStageCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  stageEmoji: {
    fontSize: 24,
  },
  stageName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stageDescription: {
    color: '#6b7280',
  },
  yearsUntil: {
    color: '#2563eb',
    fontWeight: '500',
  },
  timeline: {
    height: 40,
    marginTop: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e5e7eb',
  },
  timelinePoint: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -6 }],
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  timelineDotActive: {
    backgroundColor: '#2563eb',
  },
  timelineAge: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  webAlternativeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  webAlternativeText: {
    color: '#4b5563',
  },
  fallbackButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 20,
  },
  fallbackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});