import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";

const CartScreen = ({ route, navigation }) => {
  const { cartItems: initialCartItems } = route.params;
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id, type) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: type === "increment" ? item.quantity + 1 : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.quantity * parseFloat(item.price.replace(/[^0-9.]/g, "")),
    0
  );

  return (
    <View style={styles.container}>
      {/* Cart Items */}
      <View style={styles.cartContainer}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              {/* Product Image */}
              <Image
                source={{
                  uri: item.image || "https://via.placeholder.com/60", // Fallback for missing image
                }}
                style={styles.productImage}
              />

              {/* Product Details */}
              <View style={styles.itemDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, "decrement")}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, "increment")}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Remove Button */}
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.removeButton}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => alert("Proceed to Checkout")}
      >
        <Text style={styles.checkoutText}>Go to Checkout</Text>
        <Text style={styles.checkoutPrice}>₹{totalPrice.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  cartContainer: {
    flex: 1, // Ensures FlatList occupies only available space
    paddingHorizontal: 10,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "green",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
  },
  quantityButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#013220",
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    textAlign: "center",
  },
  removeButton: {
    fontSize: 18,
    color: "red",
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 100, // Ensures space for the checkout button
  },
  checkoutButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutPrice: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CartScreen;
