// OpenCVAgingFilters.js
import { NativeModules } from 'react-native';

/**
 * Extended OpenCV module with aging filter functions
 * This is a wrapper around the react-native-opencv3 module with additional aging-specific functions
 */
class OpenCVAgingFilters {
  constructor() {
    this.opencv = NativeModules.RNOpenCV;
    this.initialized = false;
    this.faceClassifier = null;
  }

  /**
   * Initialize OpenCV and load required resources
   */
  async initAsync() {
    if (this.initialized) return;
    
    try {
      // Initialize base OpenCV
      await this.opencv.initCV();
      
      // Load face detection classifier
      this.faceClassifier = await this.opencv.loadHaarClassifier('haarcascade_frontalface_alt.xml');
      
      // Load additional aging models if available
      // await this.opencv.loadModel('aging_model.xml');
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenCV:', error);
      throw error;
    }
  }

  /**
   * Load an image into OpenCV
   * @param {string} uri - Image URI
   * @returns {Object} OpenCV image reference
   */
  async imread(uri) {
    return await this.opencv.imageFromUri(uri);
  }

  /**
   * Write an image to file
   * @param {Object} image - OpenCV image reference
   * @param {string} filename - Output filename
   * @returns {string} Path to saved image
   */
  async imwrite(image, filename) {
    return await this.opencv.imageToUri(image, filename);
  }

  /**
   * Release OpenCV resources
   * @param {Object} resource - OpenCV resource to release
   */
  async release(resource) {
    if (resource) {
      await this.opencv.release(resource);
    }
  }

  /**
   * Detect faces in an image
   * @param {Object} image - OpenCV image reference
   * @returns {Array} Array of face rectangles
   */
  async detectFaces(image) {
    if (!this.faceClassifier) {
      throw new Error('Face classifier not loaded');
    }
    
    try {
      // Convert to grayscale for face detection
      const gray = await this.opencv.cvtColor(image, 'COLOR_BGR2GRAY');
      
      // Detect faces
      const faces = await this.opencv.detectHaarCascade(
        gray, 
        this.faceClassifier,
        1.3, // Scale factor
        5,   // Min neighbors
        0,   // Flags
        { width: 30, height: 30 } // Min size
      );
      
      // Release grayscale image
      await this.release(gray);
      
      return faces;
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  }

  /**
   * Apply child-like filter (for ages 6-10)
   * @param {Object} image - OpenCV image reference
   * @param {Object} faceRect - Face rectangle
   * @param {number} agingFactor - Aging factor (0-1)
   * @returns {Object} Processed image
   */
  async childFilter(image, faceRect, agingFactor) {
    try {
      // Clone the image to avoid modifying the original
      const result = await this.opencv.clone(image);
      
      // Extract face region
      const faceROI = await this.opencv.getRegion(result, faceRect);
      
      // Apply slight gaussian blur to smooth skin
      const blurAmount = 3 + Math.floor(2 * (1 - agingFactor)); // More blur for younger appearance
      await this.opencv.gaussianBlur(faceROI, { width: blurAmount, height: blurAmount }, 0);
      
      // Slightly brighten the face
      const brightnessFactor = 10 * (1 - agingFactor);
      await this.opencv.addWeighted(faceROI, 1, faceROI, 0, brightnessFactor);
      
      // Release face ROI
      await this.release(faceROI);
      
      return result;
    } catch (error) {
      console.error('Child filter error:', error);
      return image; // Return original on error
    }
  }

  /**
   * Apply teen filter (for ages 11-17)
   * @param {Object} image - OpenCV image reference
   * @param {Object} faceRect - Face rectangle
   * @param {number} agingFactor - Aging factor (0-1)
   * @returns {Object} Processed image
   */
  async teenFilter(image, faceRect, agingFactor) {
    try {
      // Clone the image
      const result = await this.opencv.clone(image);
      
      // Extract face region
      const faceROI = await this.opencv.getRegion(result, faceRect);
      
      // Apply light skin smoothing (less than child filter)
      const blurAmount = 1 + Math.floor(2 * (1 - agingFactor));
      await this.opencv.gaussianBlur(faceROI, { width: blurAmount, height: blurAmount }, 0);
      
      // Adjust contrast slightly
      await this.opencv.convertTo(faceROI, -1, 1.1, 0);
      
      // Release face ROI
      await this.release(faceROI);
      
      return result;
    } catch (error) {
      console.error('Teen filter error:', error);
      return image;
    }
  }

  /**
   * Apply young adult filter (for ages 18-22)
   * @param {Object} image - OpenCV image reference
   * @param {Object} faceRect - Face rectangle
   * @param {number} agingFactor - Aging factor (0-1)
   * @returns {Object} Processed image
   */
  async adultFilter(image, faceRect, agingFactor) {
    try {
      // Clone the image
      const result = await this.opencv.clone(image);
      
      // Extract face region
      const faceROI = await this.opencv.getRegion(result, faceRect);
      
      // Apply slight sharpening for more defined features
      const kernel = await this.opencv.getStructuringElement(
        'MORPH_RECT',
        { width: 3, height: 3 }
      );
      
      await this.opencv.morphologyEx(faceROI, 'MORPH_GRADIENT', kernel, { x: 1, y: 1 }, 1);
      await this.opencv.addWeighted(faceROI, 0.7, faceROI, 0.3, 0);
      
      // Release resources
      await this.release(kernel);
      await this.release(faceROI);
      
      return result;
    } catch (error) {
      console.error('Adult filter error:', error);
      return image;
    }
  }

  /**
   * Change skin texture based on age
   * @param {Object} image - OpenCV image reference
   * @param {Object} faceRect - Face rectangle
   * @param {number} agingFactor - Aging factor (0-1)
   * @returns {Object} Processed image
   */
  async changeSkinTexture(image, faceRect, agingFactor) {
    try {
      // Clone the image
      const result = await this.opencv.clone(image);
      
      // Extract face region
      const faceROI = await this.opencv.getRegion(result, faceRect);
      
      // Convert to YCrCb color space for better skin detection
      const ycrcb = await this.opencv.cvtColor(faceROI, 'COLOR_BGR2YCrCb');
      
      // Define skin color range in YCrCb
      const lowerBound = await this.opencv.newScalar(0, 133, 77);
      const upperBound = await this.opencv.newScalar(255, 173, 127);
      
      // Create skin mask
      const skinMask = await this.opencv.inRange(ycrcb, lowerBound, upperBound);
      
      // Apply appropriate texture based on age
      if (agingFactor > 0.7) { // Older age
        // Add slight texture/lines
        const textureMat = await this.opencv.clone(skinMask);
        const textureKernel = await this.opencv.getStructuringElement(
          'MORPH_ELLIPSE',
          { width: 3, height: 3 }
        );
        
        await this.opencv.morphologyEx(textureMat, 'MORPH_GRADIENT', textureKernel, { x: 1, y: 1 }, 1);
        await this.opencv.bitwise_and(faceROI, faceROI, textureMat);
        
        // Release texture resources
        await this.release(textureMat);
        await this.release(textureKernel);
      } else { // Younger age
        // Smoother skin
        const blurKernel = { width: 3, height: 3 };
        await this.opencv.gaussianBlur(faceROI, blurKernel, 0, 0, 'BORDER_DEFAULT', skinMask);
      }
      
      // Release resources
      await this.release(ycrcb);
      await this.release(lowerBound);
      await this.release(upperBound);
      await this.release(skinMask);
      await this.release(faceROI);
      
      return result;
    } catch (error) {
      console.error('Skin texture change error:', error);
      return image;
    }
  }

  /**
   * Adjust facial proportions based on age
   * @param {Object} image - OpenCV image reference
   * @param {Object} faceRect - Face rectangle
   * @param {number} agingFactor - Aging factor (0-1)
   * @returns {Object} Processed image
   */
  async adjustFacialProportions(image, faceRect, agingFactor) {
    try {
      // Clone the image
      const result = await this.opencv.clone(image);
      
      // For a more advanced implementation, we would use facial landmarks
      // to adjust specific facial features. For now, we'll use simple transformations.
      
      // Calculate the center of the face
      const centerX = faceRect.x + faceRect.width / 2;
      const centerY = faceRect.y + faceRect.height / 2;
      
      // Create transformation matrix
      // For younger ages, slightly enlarge eyes and upper face
      // For older ages, slightly elongate lower face
      const transformFactor = 0.03 * (0.5 - agingFactor); // -0.015 to 0.015
      
      // Create affine transformation
      const srcPoints = [
        { x: centerX, y: centerY - faceRect.height / 4 },  // Upper face
        { x: centerX - faceRect.width / 4, y: centerY + faceRect.height / 4 }, // Lower left
        { x: centerX + faceRect.width / 4, y: centerY + faceRect.height / 4 }  // Lower right
      ];
      
      const dstPoints = [
        { 
          x: centerX, 
          y: centerY - faceRect.height / 4 * (1 + transformFactor) 
        },
        { 
          x: centerX - faceRect.width / 4, 
          y: centerY + faceRect.height / 4 * (1 - transformFactor) 
        },
        { 
          x: centerX + faceRect.width / 4, 
          y: centerY + faceRect.height / 4 * (1 - transformFactor) 
        }
      ];
      
      // Apply affine transformation to face region
      const transformMatrix = await this.opencv.getAffineTransform(srcPoints, dstPoints);
      
      // Extract region slightly larger than face for transformation
      const expandedRect = {
        x: Math.max(0, faceRect.x - 20),
        y: Math.max(0, faceRect.y - 20),
        width: Math.min(image.cols - faceRect.x + 20, faceRect.width + 40),
        height: Math.min(image.rows - faceRect.y + 20, faceRect.height + 40)
      };
      
      const faceRegion = await this.opencv.getRegion(result, expandedRect);
      const transformedRegion = await this.opencv.warpAffine(
        faceRegion,
        transformMatrix,
        { width: expandedRect.width, height: expandedRect.height }
      );
      
      // Copy transformed region back to result
      await this.opencv.setRegion(result, transformedRegion, { x: expandedRect.x, y: expandedRect.y });
      
      // Release resources
      await this.release(transformMatrix);
      await this.release(faceRegion);
      await this.release(transformedRegion);
      
      return result;
    } catch (error) {
      console.error('Facial proportions adjustment error:', error);
      return image;
    }
  }
}

// Export singleton instance
export default new OpenCVAgingFilters();