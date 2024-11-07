import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace("Login"); // Use replace to prevent going back to SplashScreen
    }, 2000);

    return () => clearTimeout(timeout); // Clear timeout on component unmount
  }, [navigation]);
  return (
    <SafeAreaView>
      <Text>SplashScreen</Text>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
