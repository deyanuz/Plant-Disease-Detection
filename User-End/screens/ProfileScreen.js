import React, { useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { AuthContext } from "../auth/AuthContext";
import Icon from "react-native-vector-icons/Entypo";

const ProfileScreen = () => {
  const { userName, userEmail, userImage, setToken } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      {/* User Info Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: userImage }} style={styles.profileImage} />
          <View style={styles.editIconContainer}>
            <Icon name="edit" size={16} color="#FFF" />
          </View>
        </View>
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileEmail}>{userEmail}</Text>
      </View>

      {/* Profile Options */}
      <ScrollView
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.optionItem}>
            <View style={styles.labelContainer}>
              <Icon
                name="user"
                size={16}
                color="#013220"
                style={styles.labelIcon}
              />
              <Text style={styles.optionLabel}>Full Name</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your full name"
              defaultValue={userName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.labelContainer}>
              <Icon
                name="mail"
                size={16}
                color="#013220"
                style={styles.labelIcon}
              />
              <Text style={styles.optionLabel}>Email Address</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your email"
              defaultValue={userEmail}
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.labelContainer}>
              <Icon
                name="calendar"
                size={16}
                color="#013220"
                style={styles.labelIcon}
              />
              <Text style={styles.optionLabel}>Date of Birth</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your birthday"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.labelContainer}>
              <Icon
                name="phone"
                size={16}
                color="#013220"
                style={styles.labelIcon}
              />
              <Text style={styles.optionLabel}>Phone Number</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#013220",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#013220",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#013220",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#013220",
    marginBottom: 16,
    paddingLeft: 4,
  },
  optionItem: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#013220",
  },
  inputField: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#333",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#013220",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#013220",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9534F",
    backgroundColor: "#FFF",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: "#D9534F",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
