import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = ({ navigation }) => {
  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        Alert.alert("Error", "Unauthorized access.");
        navigation.navigate("Login");
      }
      setAdminToken(token);
    };
    fetchToken();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminToken");
    Alert.alert("Success", "You have logged out.");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to the Admin Dashboard!</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#013220",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Dashboard;
