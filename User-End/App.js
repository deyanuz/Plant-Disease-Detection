import { StyleSheet } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from "./auth/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";
const { config } = require("./config/config");

export default function App() {
  return (
    <StripeProvider
      publishableKey={config.stripe.publishableKey}
      merchantIdentifier="merchant.com.plantdisease.store"
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
