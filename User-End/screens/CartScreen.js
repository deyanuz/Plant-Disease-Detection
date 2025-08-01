import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import placeholder from "../assets/placeholder.jpg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { useStripe } from "@stripe/stripe-react-native";

const CartScreen = () => {
  const navigation = useNavigation();
  const route = navigation.getState().routes[navigation.getState().index];
  const { cartItems, removeFromCart, updateQuantity, setCartItems } = useCart();
  const { userID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const calculateItemTotal = (price, quantity) => {
    const numericPrice =
      typeof price === "number"
        ? price
        : parseFloat(price.replace(/[^0-9.]/g, ""));
    return numericPrice * quantity;
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + calculateItemTotal(item.price, item.quantity),
    0
  );

  const initializePaymentSheet = async () => {
    try {
      console.log(
        "Creating payment intent for amount:",
        Math.round(totalPrice * 100)
      );

      // Get payment intent from your backend
      const response = await axios.post(
        `http://${IpAddress}:8000/create-payment-intent`,
        {
          amount: Math.round(totalPrice * 100), // Convert to cents and ensure it's an integer
        }
      );

      console.log("Payment intent response:", response.data);

      if (!response.data.paymentIntent) {
        throw new Error("No payment intent received from server");
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Plant Disease Store",
        paymentIntentClientSecret: response.data.paymentIntent,
        allowsDelayedPaymentMethods: false,
        style: "automatic",
      });

      if (error) {
        console.error("Error initializing payment sheet:", error);
        Alert.alert("Error", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error initializing payment sheet:", error);
      Alert.alert(
        "Error",
        "Unable to initialize payment. Please try again later."
      );
      return false;
    }
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Initialize payment sheet
      const isPaymentSheetInitialized = await initializePaymentSheet();
      if (!isPaymentSheetInitialized) {
        setIsLoading(false);
        return;
      }

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error("Payment error:", paymentError);
        Alert.alert("Error", paymentError.message);
        setIsLoading(false);
        return;
      }

      // If payment successful, proceed with order creation
      const orderProducts = cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }));

      const orderData = {
        userID,
        products: orderProducts,
        totalAmount: totalPrice,
        paymentStatus: "completed",
      };

      const response = await axios.post(
        `http://${IpAddress}:8000/orders`,
        orderData
      );

      if (response.status === 200) {
        setCartItems([]); // Clear cart
        navigation.navigate("OrderConfirmation", {
          orderId: response.data._id,
          totalAmount: totalPrice,
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      Alert.alert(
        "Error",
        "Failed to process your order. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={item.image ? { uri: item.image } : placeholder}
        style={styles.productImage}
      />

      <View style={styles.itemDetails}>
        <View style={styles.nameAndRemove}>
          <Text style={styles.productName}>{item.name}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)}
          >
            <Icon name="cross" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.priceAndQuantity}>
          <Text style={styles.productPrice}>
            ${calculateItemTotal(item.price, item.quantity).toFixed(2)}
          </Text>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, "decrement")}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, "increment")}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Icon name="shopping-cart" size={50} color="#013220" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: 2 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {cartItems.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                isLoading && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.checkoutText}>Proceed to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#013220",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginHorizontal: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  nameAndRemove: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#013220",
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
  },
  priceAndQuantity: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#013220",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#013220",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
    color: "#013220",
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  totalLabel: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#013220",
  },
  checkoutButton: {
    backgroundColor: "#013220",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#013220",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    fontWeight: "500",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
});

export default CartScreen;
