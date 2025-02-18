import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import IpAddress from "../DeviceConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext, FIREBASE_AUTH } from "../auth/AuthContext";

const LoginScreen = () => {
  // handling navigation
  const navigation = useNavigation();

  // user information
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { token, setToken } = useContext(AuthContext);

  // handling ui
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const signIn = async () => {
    try {
      const user = {
        email: email,
        password: password,
      };
      await axios.post(`http://${IpAddress}:8000/login`, user).then((res) => {
        const token = res.data;
        AsyncStorage.setItem("token", token);
        setToken(token);
      });

      Alert.alert("Success!", "Login successful", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
        },
        { text: "OK", onPress: () => console.log("OK") },
      ]);
    } catch (error) {
      Alert.alert(
        "Login Failed",
        "There was a problem logging in. Please check your email and password and try again.",
        [{ text: "OK", onPress: () => console.log("OK") }]
      );
    } finally {
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 10, alignItems: "center" }}>
        <KeyboardAvoidingView>
          <View
            style={{
              marginTop: 70,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "500" }}>
              Log in to your account
            </Text>
          </View>
          <View style={{ marginTop: 50 }}>
            <View style={{ marginHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "gray",
                }}
              >
                Email
              </Text>
              <View
                style={{
                  borderBottomColor: "#bebebe",
                  borderBottomWidth: 1,
                }}
              >
                <TextInput
                  placeholderTextColor="#bebebe"
                  placeholder="Enter your email"
                  style={{
                    width: 340,
                    marginTop: 15,
                    paddingBottom: 10,
                    fontSize: 15,
                  }}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: "gray",
                  marginTop: 25,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomColor: "#bebebe",
                  borderBottomWidth: 1,
                }}
              >
                <TextInput
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor="#bebebe"
                  placeholder="Enter your password"
                  style={{
                    flex: 1,
                    marginTop: 15,
                    paddingBottom: 5,
                    fontSize: 15,
                  }}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{ paddingRight: 10, paddingTop: 10 }}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={26}
                    color="#bebebe"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Pressable
              onPress={signIn}
              style={{
                width: 200,
                backgroundColor: "#9d23bc",
                padding: 15,
                marginTop: 50,
                marginLeft: "auto",
                marginRight: "auto",
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                Login
              </Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text
                style={{
                  textAlign: "center",
                  color: "gray",
                  fontSize: 16,
                  margin: 12,
                  marginTop: 40,
                }}
              >
                Don't have an account? Sign up
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
