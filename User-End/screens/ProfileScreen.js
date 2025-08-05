import React, { useContext, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../auth/AuthContext";
import Icon from "react-native-vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import IpAddress from "../DeviceConfig";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const { userName, userEmail, userImage, setUserImage, setUserName, setUserEmail, updateToken } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: userEmail || "",
    phone: "",
    dateOfBirth: "",
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    // Parse the full name into first and last name
    const nameParts = userName ? userName.split(" ") : ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    setFormData({
      firstName,
      lastName,
      email: userEmail || "",
      phone: "",
      dateOfBirth: "",
    });
    setOriginalData({
      firstName,
      lastName,
      email: userEmail || "",
      phone: "",
      dateOfBirth: "",
    });
  }, [userName, userEmail]);

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required", 
          "Please grant permission to access your photo library to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsLoading(true);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userID;

      console.log("Uploading image for user:", userId);
      console.log("Image URI:", imageUri);

      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      });

      console.log("Sending request to:", `${IpAddress}:8000/upload-profile-image`);

      const response = await fetch(`${IpAddress}:8000/upload-profile-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Image upload response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("Image upload success:", data);
        setUserImage(data.imageUrl);
        if (data.token) {
          await updateToken(data.token);
        }
        Alert.alert("Success", "Profile image updated successfully!");
      } else {
        const errorText = await response.text();
        console.error("Image upload error response:", errorText);
        let errorMessage = "Failed to upload image";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Image upload exception:", error);
      Alert.alert("Error", "Failed to upload image. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userID;

      console.log("Updating profile for user:", userId);
      console.log("Form data:", formData);
      console.log("Sending request to:", `${IpAddress}:8000/update-profile`);

      const response = await fetch(`${IpAddress}:8000/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("Profile update success:", data);
        setUserName(`${formData.firstName} ${formData.lastName}`.trim());
        setUserEmail(formData.email);
        setOriginalData(formData);
        setIsEditing(false);
        if (data.token) {
          await updateToken(data.token);
        }
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        const errorText = await response.text();
        console.error("Profile update error response:", errorText);
        let errorMessage = "Failed to update profile";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Profile update exception:", error);
      Alert.alert("Error", "Failed to update profile. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading || !hasChanges()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Icon name="edit" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: userImage || "https://via.placeholder.com/120" }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity
              style={styles.imageEditButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Icon name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{userName}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
                placeholder="Enter your first name"
                editable={isEditing}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
                placeholder="Enter your last name"
                editable={isEditing}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Enter your email"
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Enter your phone number"
                editable={isEditing}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                placeholder="MM/DD/YYYY"
                editable={isEditing}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#013220",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  editButtons: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#FFF",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#013220",
  },
  imageEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#013220",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#013220",
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#013220",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#013220",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#495057",
  },
  inputDisabled: {
    backgroundColor: "#F8F9FA",
    color: "#6C757D",
  },
});

export default ProfileScreen;
