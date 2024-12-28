import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Dashboard from "../screens/Dashboard";
import AddAdmin from "../screens/AddAdmin";
import ManageProducts from "../screens/ManageProducts";
import UserHistory from "../screens/UserHistory";
import ManageOrders from "../screens/ManageOrders";

const Tab = createBottomTabNavigator();

const BottomTabs = () => (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 75,
        position: "absolute",
        bottom: 10,
        marginHorizontal: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      tabBarActiveTintColor: "#4CAF50",
      tabBarInactiveTintColor: "#888",
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Dashboard") iconName = "home-outline";
        else if (route.name === "Add Admin") iconName = "person-add-outline";
        else if (route.name === "Manage Products") iconName = "cart-outline";
        else if (route.name === "User History") iconName = "time-outline";
        else if (route.name === "Manage Orders") iconName = "clipboard-outline";
  
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
  
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Add Admin" component={AddAdmin} />
    <Tab.Screen name="Manage Products" component={ManageProducts} />
    <Tab.Screen name="User History" component={UserHistory} />
    <Tab.Screen name="Manage Orders" component={ManageOrders} />
  </Tab.Navigator>
);

export default BottomTabs;
