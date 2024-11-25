import { StyleSheet, Text, View, Stack } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SelectImageScreen from "../screens/SelectImageScreen";
import PreFinalScreen from "../screens/PreFinalScreen";
import { AuthContext } from "../auth/AuthContext";
import SplashScreen from "../screens/SplashView";

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state to show splash screen initially
  const [isSplashVisible, setIsSplashVisible] = useState(true); // State to manage SplashScreen visibility

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false); // Hide splash screen after 2 seconds
    }, 2000);

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, []);
  const MainStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };
  // const SplashStack = () => {
  //   return (
  //     <Stack.Navigator>
  //       <Stack.Screen
  //         name="Splash"
  //         component={SplashScreen}
  //         options={{ headerShown: false }}
  //       />
  //     </Stack.Navigator>
  //   );
  // };

  const AuthStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Image"
          component={SelectImageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PreFinal"
          component={PreFinalScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };
  return (
    <NavigationContainer>
      {isSplashVisible ? ( // Render SplashScreen while isSplashVisible is true
       <SplashScreen/>
      ) : (
       <MainStack/>
      )}
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
