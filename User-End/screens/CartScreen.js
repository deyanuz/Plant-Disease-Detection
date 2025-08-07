import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import placeholder from "../assets/placeholder.jpg";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { useStripe } from "@stripe/stripe-react-native";

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, removeFromCart, updateQuantity, setCartItems } = useCart();
  const { userID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Helper function to get image URI from buffer data
  const getImageUri = (item) => {
    if (item.image && item.image.data) {
      // If the item has buffer data, use the API endpoint to serve the image
      return `http://${IpAddress}:8000/product-image/${item.id}`;
    }
    return null;
  };

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

  // Validate cart before payment
  const validateCart = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before proceeding."
      );
      return false;
    }

    if (totalPrice <= 0) {
      Alert.alert("Invalid Total", "Cart total must be greater than $0.");
      return false;
    }

    return true;
  };

  // Validate shipping information
  const validateShippingInfo = () => {
    if (!contactNumber.trim()) {
      Alert.alert(
        "Contact Number Required",
        "Please enter your contact number."
      );
      return false;
    }

    if (!shippingAddress.trim()) {
      Alert.alert(
        "Shipping Address Required",
        "Please enter your shipping address."
      );
      return false;
    }

    return true;
  };

  const handleCheckout = () => {
    if (!validateCart()) {
      return;
    }
    setCheckoutModalVisible(true);
  };

  const handleProceedToPayment = () => {
    if (!validateShippingInfo()) {
      return;
    }
    setCheckoutModalVisible(false);
    startPaymentProcess();
  };

  const initializePaymentSheet = async () => {
    try {
      const amount = Math.round(totalPrice * 100);
      console.log("Creating payment intent for amount:", amount);

      // Show payment modal
      setPaymentModalVisible(true);
      setPaymentStatus("Initializing payment...");

      // Get payment intent from your backend
      const response = await axios.post(
        `http://${IpAddress}:8000/create-payment-intent`,
        {
          amount: amount,
          currency: "usd",
          paymentMethodTypes: ["card"],
        }
      );

      console.log("Payment intent response:", response.data);

      if (!response.data.paymentIntent) {
        throw new Error("No payment intent received from server");
      }

      setPaymentStatus("Setting up payment form...");

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Plant Disease Store",
        paymentIntentClientSecret: response.data.paymentIntent,
        allowsDelayedPaymentMethods: false,
        style: "automatic",
        appearance: {
          colors: {
            primary: "#013220",
          },
        },
      });

      if (error) {
        console.error("Error initializing payment sheet:", error);
        setPaymentStatus("Payment initialization failed");
        Alert.alert("Payment Error", error.message);
        return false;
      }

      setPaymentStatus("Payment form ready");
      return true;
    } catch (error) {
      console.error("Error initializing payment sheet:", error);
      setPaymentStatus("Payment initialization failed");
      Alert.alert(
        "Connection Error",
        "Unable to connect to payment service. Please check your internet connection and try again."
      );
      return false;
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentStatus("Processing payment...");

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error("Payment error:", paymentError);
        setPaymentStatus("Payment failed");

        // Handle specific payment errors
        if (paymentError.code === "Canceled") {
          Alert.alert(
            "Payment Cancelled",
            "Payment was cancelled by the user."
          );
        } else if (paymentError.code === "Failed") {
          Alert.alert(
            "Payment Failed",
            "Your payment was not successful. Please try again."
          );
        } else {
          Alert.alert("Payment Error", paymentError.message);
        }
        return false;
      }

      setPaymentStatus("Payment successful!");
      return true;
    } catch (error) {
      console.error("Error during payment:", error);
      setPaymentStatus("Payment failed");
      Alert.alert(
        "Payment Error",
        "An unexpected error occurred during payment."
      );
      return false;
    }
  };

  const createOrder = async () => {
    try {
      setPaymentStatus("Creating order...");

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
        contactNumber: contactNumber.trim(),
        shippingAddress: shippingAddress.trim(),
      };

      console.log("Creating order:", {
        userID,
        totalAmount: totalPrice,
        productCount: orderProducts.length,
        contactNumber: contactNumber.trim(),
        shippingAddress: shippingAddress.trim(),
      });

      const response = await axios.post(
        `http://${IpAddress}:8000/orders`,
        orderData
      );

      if (response.status === 200) {
        console.log("Order created successfully:", response.data._id);
        setPaymentStatus("Order created successfully!");
        return response.data;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setPaymentStatus("Order creation failed");
      Alert.alert(
        "Order Error",
        "Failed to create your order. Please contact support."
      );
      return null;
    }
  };

  const startPaymentProcess = async () => {
    try {
      setIsLoading(true);

      // Initialize payment sheet
      const isPaymentSheetInitialized = await initializePaymentSheet();
      if (!isPaymentSheetInitialized) {
        setIsLoading(false);
        setPaymentModalVisible(false);
        return;
      }

      // Process payment
      const isPaymentSuccessful = await handlePayment();
      if (!isPaymentSuccessful) {
        setIsLoading(false);
        setPaymentModalVisible(false);
        return;
      }

      // Create order
      const orderData = await createOrder();
      if (!orderData) {
        setIsLoading(false);
        setPaymentModalVisible(false);
        return;
      }

      // Success - clear cart and navigate
      setCartItems([]); // Clear cart
      setPaymentModalVisible(false);
      setContactNumber("");
      setShippingAddress("");

      // Show success message
      Alert.alert(
        "Payment Successful!",
        `Your order has been placed successfully. Order ID: ${orderData._id}`,
        [
          {
            text: "View Order",
            onPress: () =>
              navigation.navigate("OrderConfirmation", {
                orderId: orderData._id,
                totalAmount: totalPrice,
              }),
          },
          {
            text: "Continue Shopping",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (error) {
      console.error("Error during checkout:", error);
      Alert.alert(
        "Checkout Error",
        "An unexpected error occurred during checkout. Please try again."
      );
    } finally {
      setIsLoading(false);
      setPaymentModalVisible(false);
      setPaymentStatus("");
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.image && item.image.data ? (
        <Image
          source={{ uri: getImageUri(item) }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => {
            console.log("Image failed to load for cart item:", item.id);
          }}
          onLoad={() => {
            console.log("Image loaded successfully for cart item:", item.id);
          }}
        />
      ) : (
        <Image
          source={item.image ? { uri: item.image } : placeholder}
          style={styles.productImage}
        />
      )}

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
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
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

            {/* Payment Security Info */}
            <View style={styles.securityInfo}>
              <Icon name="lock" size={16} color="#013220" />
              <Text style={styles.securityText}>
                Secure payment powered by Stripe
              </Text>
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
                <Text style={styles.checkoutText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shipping Information</Text>
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="cross" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contact Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your contact number"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Shipping Address *</Text>
              <TextInput
                style={[styles.textInput, styles.addressInput]}
                placeholder="Enter your shipping address"
                value={shippingAddress}
                onChangeText={setShippingAddress}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.proceedToPaymentButton}
              onPress={handleProceedToPayment}
            >
              <Text style={styles.proceedToPaymentText}>
                Proceed to Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#013220" />
            <Text style={styles.modalTitle}>Processing Payment</Text>
            <Text style={styles.modalStatus}>{paymentStatus}</Text>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    // paddingVertical: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
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
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  nameAndRemove: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#013220",
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#FFF5F5",
  },
  priceAndQuantity: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#013220",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#013220",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 18,
    textAlign: "center",
    color: "#013220",
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 3,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#013220",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingVertical: 6,
    backgroundColor: "#F8F8F8",
    borderRadius: 6,
  },
  securityText: {
    fontSize: 11,
    color: "#013220",
    marginLeft: 5,
    fontWeight: "500",
  },
  checkoutButton: {
    backgroundColor: "#013220",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#013220",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  continueShoppingButton: {
    marginTop: 16,
    backgroundColor: "#013220",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  continueShoppingText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 18,
    width: "90%",
    maxWidth: 380,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#013220",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#013220",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F8F8F8",
  },
  addressInput: {
    height: 70,
  },
  proceedToPaymentButton: {
    backgroundColor: "#013220",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  proceedToPaymentText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    minWidth: 220,
  },
  modalStatus: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default CartScreen;
