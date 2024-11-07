import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRegProgress } from "../registrationUtils";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import IpAddress from "../DeviceConfig";

const PreFinalScreen = () => {
  //const { token, setToken } = useContext();
  const [userData, setUserData] = useState();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   if (token) {
  //     navigation.replace("MainStack", { screen: "Main" });
  //   }
  // }, [token]);

  useEffect(() => {
    getAllScreenData();
  }, []);

  const getAllScreenData = async () => {
    try {
      const screens = ["Register", "Image"];
      let uData = {};
      for (const sName of screens) {
        const screenData = await getRegProgress(sName);
        if (screenData) {
          uData = { ...uData, ...screenData };
        }
      }
      setUserData(uData);
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllScreenData = async () => {
    try {
      const screens = ["Register", "Image"];
      for (const sName of screens) {
        const key = `registration_progress_${sName}`;
        if (key) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const registerUser = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `http://${IpAddress}:8000/register`,
        userData
      );

      if (res.status == 200) {
        const token = res.data;
        await AsyncStorage.setItem("token", token);
        //setToken(token);
        Alert.alert("Success!", "Account created successfully", [
          {
            text: "Cancel",
            onPress: () => console.log("Ask me later pressed"),
          },
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
        clearAllScreenData();
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Failure!", "Account creation Failed", [
        {
          text: "Cancel",
          onPress: () => console.log("Ask me later pressed"),
        },
        { text: "OK", onPress: () => navigation.navigate("Register") },
      ]);
    } finally {
      setLoading(false);
    }
  };
  console.log(userData);
  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <View style={{ marginTop: 80 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", marginLeft: 20 }}>
            All set to register
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              marginLeft: 20,
              marginTop: 10,
            }}
          >
            Setting up your profile for you
          </Text>
        </View>
      </SafeAreaView>
      <Pressable
        onPress={registerUser}
        style={{
          color: "white",
          padding: 15,
          backgroundColor: "#a71ec9",
          marginTop: "auto",
          marginBottom: 30,
          padding: 12,
          marginHorizontal: 10,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          Finish
        </Text>
      </Pressable>
    </>
  );
};

export default PreFinalScreen;

const styles = StyleSheet.create({});
