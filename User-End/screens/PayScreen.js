import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useStripe, CardField } from "@stripe/stripe-react-native";

const PayScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const stripe = useStripe();

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Invalid Card Details", "Please fill out the card details completely.");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your backend URL
      const response = await fetch("http://192.168.0.114:8081/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2000 }), // Amount in cents (e.g., $20.00)
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the backend.");
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret from backend.");
      }

      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        paymentIntentClientSecret: clientSecret,
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            email: "sumaiyakhan3572213@gmail.com", // Replace with logged-in user's email if available
          },
        },
      });

      if (error) {
        Alert.alert("Payment Failed", error.message);
      } else {
        Alert.alert("Success", "Payment was successful!");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>
      <CardField
        postalCodeEnabled={true}
        placeholders={{ number: "4242 4242 4242 4242" }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={(cardDetails) => setCardDetails(cardDetails)}
      />
      <TouchableOpacity
        style={[styles.payButton, isLoading && { backgroundColor: "#ccc" }]}
        onPress={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  cardContainer: { width: "100%", height: 50, marginVertical: 20 },
  card: { backgroundColor: "#EFEFEF", borderRadius: 8 },
  payButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 5, width: "100%", alignItems: "center" },
  payButtonText: { color: "#fff", fontSize: 16 },
});

export default PayScreen;
