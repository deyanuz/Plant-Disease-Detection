import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Dashboard from "../screens/Dashboard";
import AddProduct from "../screens/AddProduct";
import ProductList from "../screens/ProductList";
import ManageOrders from "../screens/ManageOrders";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ initialRoute = "Home" }) => (
  <Tab.Navigator
    initialRouteName={initialRoute}
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
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: "#888",
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Home") iconName = "home-outline";
        else if (route.name === "Add") iconName = "add-circle-outline";
        else if (route.name === "Products") iconName = "cube-outline";
        else if (route.name === "Orders") iconName = "cart-outline";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={Dashboard} />
    <Tab.Screen name="Add" component={AddProduct} />
    <Tab.Screen name="Products" component={ProductList} />
    <Tab.Screen name="Orders" component={ManageOrders} />
  
  </Tab.Navigator>
);

export default BottomTabs;
