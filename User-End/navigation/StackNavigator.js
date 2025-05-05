import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CartScreen from "../screens/CartScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SelectImageScreen from "../screens/SelectImageScreen";
import PreFinalScreen from "../screens/PreFinalScreen";
import { AuthContext } from "../auth/AuthContext";
import SplashScreen from "../screens/SplashView";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import UserScreen from "../screens/UserScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HistoryScreen from "../screens/HistoryScreen";
import OrderScreen from "../screens/OrderScreen";
import PayScreen from "../screens/PayScreen";
import DetectScreen from "../screens/DetectScreen";
import DrawerContent from "../components/DrawerContent";
import Entypo from "react-native-vector-icons/Entypo";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CartProvider, useCart } from "../context/CartContext";

import Chatbot from "../screens/ChatbotScreen";
import OrderConfirmation from '../screens/OrderConfirmation';

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const Drawer = createDrawerNavigator();
  const Tab = createBottomTabNavigator();
  const [showCamera, setShowCamera] = useState(false);

  // Drawer Navigator
  const DrawerNav = () => {
    return (
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          statusBarColor: "#013220",
          headerStyle: { backgroundColor: "#F8F8F8", elevation: 0 },
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable onPress={() => navigation.toggleDrawer()}>
              <Entypo
                name="menu"
                size={30}
                color="#000"
                style={{ marginLeft: 10 }}
              />
            </Pressable>
          ),
          drawerType: "slide",
          overlayColor: "rgba(0,0,0,0.5)",
          drawerStyle: {
            width: "80%",
          },
          swipeEnabled: true,
          gestureEnabled: true,
        })}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name="User"
          component={UserScreen}
          options={{ headerTitle: "User" }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerTitle: "Profile" }}
        />
        <Drawer.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerTitle: "History" }}
        />
      </Drawer.Navigator>
    );
  };

  // Bottom Tab Navigator
  const TabNav = ({ route }) => {
    const { totalItems } = useCart();

    return (
      <Tab.Navigator
        animation="slide_from_right"
        animationEnabled={true}
        animationTypeForReplace="push"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            let IconComponent;

            if (route.name === "Home") {
              iconName = "home";
              IconComponent = Entypo;
            } else if (route.name === "Chatbot") {
              iconName = "chat-processing-outline";
              IconComponent = MaterialCommunityIcons;
            } else if (route.name === "Cart") {
              iconName = "shopping-cart";
              IconComponent = Entypo;
              return (
                <View>
                  <IconComponent name={iconName} size={size} color={color} />
                  {totalItems > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {totalItems > 99 ? "99+" : totalItems}
                      </Text>
                    </View>
                  )}
                </View>
              );
            } else if (route.name === "Pay") {
              iconName = "credit-card";
              IconComponent = Entypo;
            }

            return <IconComponent name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#013220",
          tabBarInactiveTintColor: "gray",
          headerShown: route.name !== "Home",
          tabBarStyle: {
            height: 60,
            animation: "timing",
            config: {
              duration: 200,
            },
          },
          tabBarHideOnKeyboard: true,
          tabBarVisibilityAnimationConfig: {
            duration: 200,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={DrawerNav}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Chatbot"
          component={Chatbot}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
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
      <Stack.Navigator
        screenOptions={{
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animationEnabled: true,
          animationTypeForReplace: "push",
          headerMode: "screen",
          presentation: "card",
        }}
      >
        <Stack.Screen
          name="Main"
          animation="slide_from_right"
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
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ headerTitle: "Product Details" }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Camera"
          component={DetectScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Pay"
          component={PayScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="OrderConfirmation" 
          component={OrderConfirmation}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };

  const AuthStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animationEnabled: true,
          animationTypeForReplace: "push",
          headerMode: "screen",
          presentation: "card",
        }}
      >
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
    <CartProvider>
      <NavigationContainer>
        {isSplashVisible ? (
          <SplashScreen />
        ) : token == null || token == "" ? (
          <AuthStack />
        ) : (
          <MainStack />
        )}
      </NavigationContainer>
    </CartProvider>
  );
};

export default StackNavigator;

// Styles
const styles = StyleSheet.create({
  cameraButton: {
    width: 70,
    height: 70,
    backgroundColor: "#013220",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    zIndex: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "#FF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
