import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";
import placeholder from "../assets/placeholder.jpg";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { useCart } from "../context/CartContext";

const UserScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  const categories = [
    { id: 1, name: "Jute", icon: "🌾" },
    { id: 2, name: "Tomato", icon: "🍅" },
    { id: 3, name: "Strawberry", icon: "🍓" },
    { id: 4, name: "Potato", icon: "🥔" },
  ]; // Simulate fetching JSON data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://${IpAddress}:8000/products`);
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // You could set some error state here if needed
      }
    };

    fetchProducts();
    console.log(products);
  }, []);

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    };
    addToCart(cartItem);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon
            name="magnifying-glass"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput placeholder="Search" style={styles.searchInput} />
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryText}>{category.name}</Text>
          </View>
        ))}
      </View>

      {/* Featured Products */}
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={products}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() =>
              navigation.navigate("ProductDetails", { product: item })
            }
          >
            <Image
              source={item.image ? { uri: item.image } : placeholder}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <View>
                  <Text style={styles.productPrice}>${item.price}/Kg</Text>
                  <Text style={styles.productDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <Pressable
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                  android_ripple={{
                    color: "#fff",
                    borderless: true,
                    radius: 18,
                  }}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item, index) => index}
      />

      {/* Add the Camera Button */}
      <Pressable
        style={[styles.cameraButton, styles.shadow]}
        onPress={() => navigation.navigate("Camera")}
        android_ripple={{
          color: "#fff",
          borderless: true,
          radius: 30,
        }}
      >
        <Icon name="camera" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 15,
  },
  searchContainer: {
    marginVertical: 15,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#013220",
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginRight: 5,
    color: "#013220",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#013220",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  categoryItem: {
    backgroundColor: "#FFF",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#013220",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: "#013220",
  },
  categoryIcon: {
    fontSize: 30,
    color: "#013220",
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    color: "#013220",
  },
  productCard: {
    backgroundColor: "#FFF",
    width: "47%",
    height: 250,
    margin: 5,
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    width: "100%",
    height: 80,
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#013220",
    marginBottom: 2,
    width: "100%",
  },
  productPrice: {
    fontSize: 14,
    color: "#013220",
    fontWeight: "600",
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    width: "100%",
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: "#013220",
    borderRadius: 20,
    width: 36,
    height: 36,
    position: "absolute",
    bottom: 8,
    right: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 20,
  },
  cameraButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 65,
    height: 65,
    backgroundColor: "#013220",
    borderRadius: 32.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  shadow: {
    shadowColor: "#013220",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default UserScreen;
