import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Alert } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../auth/AuthContext";

// Import screens
import AddAdmin from "../screens/AddAdmin";
import ManageProducts from "../screens/ManageProducts";
import UserList from "../screens/UserList";
import Notifications from "../screens/Notifications";
import BottomTabs from "./BottomTabs";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';

const Drawer = createDrawerNavigator();



const DrawerNavigation = () => {
  const { setToken } = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("adminToken");
      setToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        drawerStyle: {
          backgroundColor: COLORS.drawer.background,
          width: 280,
        },
        drawerLabelStyle: {
          color: COLORS.drawer.text,
        },
        drawerActiveTintColor: COLORS.drawer.activeText,
        drawerInactiveTintColor: COLORS.drawer.inactiveText,
        drawerActiveBackgroundColor: COLORS.drawer.activeBackground,
      }}
    >
      <Drawer.Screen 
        name="Dashboard"
        component={BottomTabs}
        options={{
          headerShown: false,
          drawerIcon: ({color}) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Admin Management" 
        component={AddAdmin}
        options={{
          headerShown: false,
          drawerIcon: ({color}) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="User List" 
        component={UserList}
        options={{
          headerShown: false,
          drawerIcon: ({color}) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={Notifications}
        options={{
          headerShown: false,
          drawerIcon: ({color}) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Sign Out" 
        component={EmptyComponent}
        listeners={{
          drawerItemPress: () => {
            handleSignOut();
            return true;
          },
        }}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="log-out-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Empty component for Sign Out option
const EmptyComponent = () => <View />;

export default DrawerNavigation; 