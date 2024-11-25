import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import UserScreen from "./useScreenr";
import ProfileScreen from "./profileScreen";
import HistoryScreen from "./HistoryScreen";
import OrderScreen from "./OrderScreen";
import PayScreen from "./PayScreen";
import DrawerContent from "./DrawerContent";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Side Navigation (User, Profile, History)
const StackNav = ({ navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarColor: "#0163d2",
        headerStyle: { backgroundColor: "#0163d2" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="User"
        component={UserScreen}
        options={{
          headerLeft: () => (
            <Pressable onPress={() => navigation.toggleDrawer()}>
              <Icon name="menu" size={30} color="#fff" style={{ marginLeft: 10 }} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

// Drawer Navigator (Side Navigation)
const DrawerNav = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="User" component={StackNav} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="History" component={HistoryScreen} />
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

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0163d2",
        tabBarInactiveTintColor: "gray",
        headerShown: route.name !== "Home",
      })}
    >
      <Tab.Screen name="Home" component={DrawerNav} />
      <Tab.Screen name="Order" component={OrderScreen} />
      <Tab.Screen name="Pay" component={PayScreen} />
    </Tab.Navigator>
  );
};

// Main App Component
const HomeScreen = () => {
  return (

      <TabNav />
    
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
