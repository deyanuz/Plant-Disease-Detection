import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../auth/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../auth/AuthContext";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);
  const signOutAndClearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setToken("");

      navigation.replace("Login");

      Alert.alert("Success!", "Log out successful", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
        },
        { text: "OK", onPress: () => console.log("OK") },
      ]);
    } catch (error) {
      console.log("Error", error);
    }
  };
  return (
    <SafeAreaView>
      <View
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
        <Pressable onPress={signOutAndClearAuthToken}>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            Log Out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
