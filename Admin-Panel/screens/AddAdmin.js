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
import axios from "axios";
import BASE_URL from "../DeviceConfig"; // Import your API base URL

const AddAdmin = () => {
  const [admins, setAdmins] = useState([]); // Admin list
  const [newAdminEmail, setNewAdminEmail] = useState(""); // New admin email
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch Admins from the backend
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/admins`);
      setAdmins(response.data); // Populate admin list
    } catch (error) {
      console.error("Error fetching admins:", error);
      Alert.alert("Error", "Failed to fetch admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new admin
  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      Alert.alert("Error", "Please enter an email.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/admins`, { email: newAdminEmail });
      Alert.alert("Success", "Admin added successfully!");
      setNewAdminEmail(""); // Clear input field
      fetchAdmins(); // Refresh admin list
    } catch (error) {
      console.error("Error adding admin:", error);
      Alert.alert("Error", "Failed to add admin. Please try again.");
    }
  };

  // Delete an admin
  const handleDeleteAdmin = async (id, isPrimary) => {
    if (isPrimary) {
      Alert.alert("Error", "The primary admin cannot be deleted.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/admins/${id}`);
      Alert.alert("Success", "Admin deleted successfully!");
      fetchAdmins(); // Refresh admin list
    } catch (error) {
      console.error("Error deleting admin:", error);
      Alert.alert("Error", "Failed to delete admin. Please try again.");
    }
  };

  // Render an admin item
  const renderAdminItem = ({ item }) => (
    <View style={styles.adminItem}>
      <Text style={styles.adminEmail}>{item.email}</Text>
      {!item.isPrimary && ( // Show delete button only for non-primary admins
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAdmin(item._id, item.isPrimary)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
      {item.isPrimary && (
        <Text style={styles.primaryLabel}>Primary Admin</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Admin Management</Text>

      {/* Add Admin Section */}
      <View style={styles.addAdminContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new admin email"
          value={newAdminEmail}
          onChangeText={setNewAdminEmail}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddAdmin}>
          <Text style={styles.addButtonText}>Add Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}

      {/* Admin List */}
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  adminItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  adminEmail: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF6F61",
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
