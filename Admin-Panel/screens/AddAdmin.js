import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

const BASE_URL = "http://192.168.0.101:9000"; // Replace with your server URL

const AddAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/admins`);
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      Alert.alert("Error", "Failed to fetch admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/admins`, {
        email: newAdminEmail,
        password,
      });
      Alert.alert("Success", "Admin added successfully!");
      setNewAdminEmail("");
      setPassword("");
      setConfirmPassword("");
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      Alert.alert("Error", "Failed to add admin. Please try again.");
    }
  };

  const handleDeleteAdmin = async (id, isPrimary) => {
    if (isPrimary) {
      Alert.alert("Error", "The primary admin cannot be deleted.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/admins/${id}`);
      Alert.alert("Success", "Admin deleted successfully!");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      Alert.alert("Error", "Failed to delete admin. Please try again.");
    }
  };

  const renderAdminItem = ({ item }) => (
    <View style={styles.adminItem}>
      <Text style={styles.adminEmail}>{item.email}</Text>
      {item.isPrimary && (
        <Text style={styles.primaryLabel}>Primary Admin</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Admin Management</Text>

      <View style={styles.addAdminContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new admin email"
          value={newAdminEmail}
          onChangeText={setNewAdminEmail}
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirm Password"
            secureTextEntry={!isConfirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() =>
              setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
            }
          >
            <Ionicons
              name={
                isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"
              }
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAdmin}>
          <Text style={styles.addButtonText}>Add Admin</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4CAF50" />}

      {!loading && (
        <FlatList
          data={admins}
          keyExtractor={(item) => item._id}
          renderItem={renderAdminItem}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No admins available.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  addAdminContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  adminItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminEmail: {
    fontSize: 16,
    color: "#333",
  },
  primaryLabel: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default AddAdmin;
