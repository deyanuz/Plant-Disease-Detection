import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from "react-native";
import React, { useContext, useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { AuthContext } from "../auth/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const DetectScreen = () => {
  const [image, setImage] = useState();
  const [isDetected, setIsDetected] = useState(false);
  const [predictedClass, setPredictedClass] = useState();
  const [confidence, setConfidence] = useState();
  const { userID } = useContext(AuthContext);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
      } else if (response.status === 201) {
        setIsDetected(true);
        setPredictedClass("Not a leaf");
        setConfidence(response.data.confidence);
      } else {
        console.error("Failed to send image");
        Alert.alert("Error", "Failed to detect disease");
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      Alert.alert("Error", "Something went wrong while sending the image.");
    }
  };

  const handleBackPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 50,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="chevron-left"
            size={20}
            color="#013220"
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.imageTextContainer}>
        <Text style={styles.title}>Disease Detection</Text>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="image" size={50} color="#888" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>
      </View>

      {isDetected ? (
        <View style={styles.detectedContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.predictedClassText}>Detected Condition:</Text>
            <Text style={styles.conditionText}>{predictedClass}</Text>
            <Text style={styles.confidentText}>Confidence: {confidence}%</Text>
          </View>
          <TouchableOpacity
            onPress={refreshDetection}
            style={styles.primaryButton}
          >
            <Icon
              name="refresh"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Try Another Image</Text>
          </TouchableOpacity>
        </View>
      ) : image ? (
        <View style={styles.detectButtonContainer}>
          <TouchableOpacity
            onPress={sendImageToBackend}
            style={styles.primaryButton}
          >
            <Icon
              name="search"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Detect Disease</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={pickFromGallery}
            style={styles.secondaryButton}
          >
            <Icon
              name="image"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickFromCamera}
            style={styles.primaryButton}
          >
            <Icon
              name="camera"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Capture from Camera</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

export default DetectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#013220",
    marginLeft: 5,
  },
  imageTextContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#013220",
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: "#013220",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  detectButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  detectedContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  resultCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 15,
    backgroundColor: "#013220",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryButton: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 15,
    backgroundColor: "#2E8B57",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  predictedClassText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#013220",
    marginBottom: 10,
  },
  confidentText: {
    fontSize: 16,
    color: "#666",
  },
});
