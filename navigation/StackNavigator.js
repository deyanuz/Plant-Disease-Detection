import { StyleSheet, Text, View, Pressable } from "react-native";
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

import UserScreen from "../screens/UserScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HistoryScreen from "../screens/HistoryScreen";
import OrderScreen from "../screens/OrderScreen";
import PayScreen from "../screens/PayScreen";
import DrawerContent from "../components/DrawerContent";
import Entypo from "react-native-vector-icons/Entypo";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

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
  const Drawer = createDrawerNavigator();
  const Tab = createBottomTabNavigator();

  // Drawer Navigator (Side Navigation)
  const DrawerNav = () => {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerShown: false, // Disable header for Drawer Navigator
        }}
        drawerContent={(props) => <DrawerContent {...props} />} // Use custom DrawerContent
      >
        <Drawer.Screen
          name="User"
          component={UserScreen}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    );
  };

  // Bottom Tab Navigator (Home, Order, Pay)
  const TabNav = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Order") {
              iconName = "shopping-bag";
            } else if (route.name === "Pay") {
              iconName = "credit-card";
            }
return <Entypo name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#013220",
          tabBarInactiveTintColor: "gray",
          headerShown: route.name !== "Home",
        })}
      >
        <Tab.Screen
          name="Home"
          component={DrawerNav}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Order"
          component={OrderScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Pay"
          component={PayScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    );
  };
  const MainStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNav}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="User" component={UserScreen} options={{}} />
      </Stack.Navigator>
    );
  };

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
      {isSplashVisible ? (
        <SplashScreen />
      ) : token == null || token == "" ? (
        <AuthStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
