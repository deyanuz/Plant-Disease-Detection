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
      {/* User Info */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: userImage }} style={styles.profileImage} />
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileEmail}>{userEmail}</Text>
      </View>

      {/* Editable Options */}
      <ScrollView style={styles.optionsContainer}>
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your name"
            defaultValue={userName}
          />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Email</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your email"
            defaultValue={userEmail}
          />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Birthday</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your birthday"
          />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Phone</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your phone number"
          />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionLabel}>Password</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your password"
            secureTextEntry
          />
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
    backgroundColor: "#013220",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  profileEmail: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 5,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  optionItem: {
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  logoutButton: {
    backgroundColor: "#D9534F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
