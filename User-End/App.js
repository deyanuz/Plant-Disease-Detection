import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from "./auth/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function App() {
  return (
    <StripeProvider
      publishableKey="your_publishable_key"
      merchantIdentifier="merchant.com.plant.disease"
    >
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
