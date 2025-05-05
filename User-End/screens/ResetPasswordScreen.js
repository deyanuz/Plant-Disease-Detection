import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import Icon from "react-native-vector-icons/Entypo";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      const response = await axios.post(
        `http://${IpAddress}:8000/reset-password`,
        {
          email: email.trim(),
        }
      );

      if (response.status === 200) {
        Alert.alert(
          "Success",
          "Password reset link has been sent to your email",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send reset link. Please check your email and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#bebebe"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Pressable style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  textContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "gray",
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#bebebe",
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#9d23bc",
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
