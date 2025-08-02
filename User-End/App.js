import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from "./auth/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RrapwF3HAo508cLPgOEi6dABLM2ZSyzSROTOdiZEvw3K3juBOuffnhz2H1Vdb7eZ38vA6bloKgba6GCgSjMGphz00F6deJulp"
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
