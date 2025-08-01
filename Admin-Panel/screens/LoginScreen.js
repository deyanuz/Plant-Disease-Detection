import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      // Format email properly (lowercase and trim)
      const formattedEmail = email.toLowerCase().trim();
      
      console.log("Attempting login with:", { email: formattedEmail, password: password ? "***" : "empty" });
      
      const response = await axios.post(
        `http://${IpAddress}:9000/admin/login`,
        {
          email: formattedEmail,
          password: password.trim(),
        }
      );

      const { token } = response.data;
      await AsyncStorage.setItem("adminToken", token); // Save the token
      setToken(token);
      Alert.alert("Success", "Login successful!");
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {/* <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      /> */}
      <View
        style={{
          flexDirection: "row",
          borderColor: "#ccc",
          borderWidth: 1,
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <TextInput
          secureTextEntry={!isPasswordVisible}
          placeholder="Password"
          style={{
            flex: 1,
            padding: 15,
            fontSize: 15,
          }}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={{ paddingRight: 10, alignSelf: "center" }}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
            size={26}
            color="#bebebe"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  button: {
    width: "100%",
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

export default LoginScreen;
