import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { AuthContext } from "../auth/AuthContext";

const DetectScreen = () => {
  const [image, setImage] = useState();
  const [isDetected, setIsDetected] = useState(false);
  const [predictedClass, setPredictedClass] = useState();
  const [confidence, setConfidence] = useState();
  const { userID } = useContext(AuthContext);
  const refreshDetection = () => {
    setIsDetected(false);
    setImage("");
    setConfidence("");
    setPredictedClass("");
  };
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      } else {
        console.log("Image picking canceled");
      }
    } else {
      Alert.alert("Failure!", "Access Denied", [
        { text: "Cancel", onPress: () => console.log("Cancel") },
        { text: "OK", onPress: () => console.log("OK") },
      ]);
    }
  };
  const pickFromCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      } else {
        console.log("Camera operation canceled");
      }
    } else {
      Alert.alert("Failure!", "Access Denied", [
        { text: "Cancel", onPress: () => console.log("Cancel") },
        { text: "OK", onPress: () => console.log("OK") },
      ]);
    }
  };

  const sendImageToBackend = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    const formData = new FormData();

    // Append the image to the form data
    formData.append("image", {
      uri: image,
      name: "image.jpg",
      type: "image/jpeg",
    });
    formData.append("userID", userID);

    try {
      // Send the image to the backend
      const response = await axios.post(
        `http://${IpAddress}:8000/detect`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check for successful response
      if (response.status === 200) {
        const result = response.data; // Directly access response.data
        console.log("Prediction Result:", result);
        setIsDetected(true);
        setConfidence(result.confidence);
        setPredictedClass(result.predictedClass);
      } else {
        console.error("Failed to send image");
        Alert.alert("Error", "Failed to detect disease");
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      Alert.alert("Error", "Something went wrong while sending the image.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        <Text style={styles.title}>Select an Image</Text>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>No image selected</Text>
          )}
        </View>
      </View>
      {isDetected ? (
        <View style={styles.detectedContainer}>
          <Text style={styles.predictedClassText}>
            Condition: {predictedClass}
          </Text>
          <Text style={styles.confidentText}>Confidence: {confidence}</Text>
          <TouchableOpacity onPress={refreshDetection} style={styles.button}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : image ? (
        <View style={styles.detectButtonContainer}>
          <TouchableOpacity onPress={sendImageToBackend} style={styles.button}>
            <Text style={styles.buttonText}>Detect Disease</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={pickFromGallery} style={styles.button}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFromCamera} style={styles.button}>
            <Text style={styles.buttonText}>Capture from Camera</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DetectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  imageTextContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#013220",
  },
  imageContainer: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#9d23bc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6e6e6",
    marginVertical: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 60,
  },
  detectButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 80,
  },
  detectedContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 80,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    backgroundColor: "#9d23bc",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  predictedClassText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#013220",
    textAlign: "center",
    marginVertical: 10,
  },
  confidentText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginVertical: 5,
  },
});
