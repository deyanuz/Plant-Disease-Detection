import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from "./auth/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51P9ieEFzDwwNH06ps51NKmvtSREV4t3fMu07kgllIZQxZ5oA6fOd1D4frpkVEHzjWqxL3g66nk5c5gbbIeremnSE005hNHanq9"
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
