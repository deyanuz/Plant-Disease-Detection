import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Dashboard from "../screens/Dashboard";
import AddProduct from "../screens/AddProduct";
import ManageOrders from "../screens/ManageOrders";
import TransactionManagement from "../screens/TransactionManagement";

const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 65,
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
        if (route.name === "Home") iconName = "home-outline";
        else if (route.name === "Add") iconName = "add-circle-outline";
        else if (route.name === "Orders") iconName = "cart-outline";
        else if (route.name === "Transactions") iconName = "cash-outline";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={Dashboard} />
    <Tab.Screen name="Add" component={AddProduct} />
    <Tab.Screen name="Orders" component={ManageOrders} />
    <Tab.Screen name="Transactions" component={TransactionManagement} />
  </Tab.Navigator>
);

export default BottomTabs;
