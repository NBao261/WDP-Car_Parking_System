import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
// Use your actual backend URL here
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api/v1';

export default function ScanPlateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        if (photo) {
          setScannedImage(photo.uri);
          processImage(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setScannedImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri,
        name: 'plate.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(`${API_URL}/alpr/scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        Alert.alert(
          "Plate Recognized",
          `Plate: ${data.licensePlate}\nConfidence: ${(data.confidence * 100).toFixed(1)}%\n\nReservation Found!`,
          [
            { text: "Confirm Check-In", onPress: () => router.back() },
            { text: "Cancel", onPress: () => setScannedImage(null), style: "cancel" }
          ]
        );
      } else {
        Alert.alert("Notice", response.data.message || "Plate recognized but no reservation found.");
        setScannedImage(null);
      }
    } catch (error: any) {
      console.log("ALPR Error", error.response?.data || error.message);
      Alert.alert(
        "Recognition Failed", 
        error.response?.data?.message || "Could not recognize license plate. Please try again."
      );
      setScannedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan License Plate</Text>
        <View style={{ width: 24 }} />
      </View>

      {scannedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: scannedImage }} style={styles.preview} />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Analyzing Plate...</Text>
            </View>
          )}
        </View>
      ) : (
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.overlay}>
            <View style={styles.guideBox} />
            <Text style={styles.guideText}>Align license plate within the frame</Text>
          </View>
        </CameraView>
      )}

      <View style={styles.controls}>
        {!scannedImage && (
          <>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 50 }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: Colors.white,
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: Colors.white,
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    width: 300,
    height: 150,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.md,
  },
  guideText: {
    color: Colors.white,
    marginTop: Spacing.xl,
    fontSize: Typography.fontSize.md,
  },
  controls: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.black,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
