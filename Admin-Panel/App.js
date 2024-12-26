import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import Dashboard from "./screens/Dashboard";
import { AuthProvider } from "./auth/AuthContext";
import StackNavigator from "./navigation/StackNavigator";

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
};

export default App;
