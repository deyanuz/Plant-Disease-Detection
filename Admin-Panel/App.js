import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import Dashboard from "./screens/Dashboard";
import { AuthProvider } from "./auth/AuthContext";
import StackNavigator from "./navigation/StackNavigator";
import 'react-native-gesture-handler';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
};

export default App;
