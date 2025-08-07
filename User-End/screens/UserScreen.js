import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { addToCart } = useCart();

  const categories = [
    { id: 1, name: "Jute", icon: "🌾" },
    { id: 2, name: "Corn", icon: "🌽" },
    { id: 3, name: "Rice", icon: "🍚" },
  ];

  // Helper function to get image URI from buffer data
  const getImageUri = (product) => {
    if (product.image && product.image.data) {
      // If the product has buffer data, use the API endpoint to serve the image
      return `http://${IpAddress}:8000/product-image/${product._id}`;
    }
    return null;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://${IpAddress}:8000/products`);
        console.log(response.data);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // You could set some error state here if needed
      }
    };

    fetchProducts();
    console.log(products);
  }, []);

  // Filter products based on search query and selected category
  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

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
          <TextInput
            placeholder="Search products..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Icon name="cross" size={16} color="#888" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryContainer}>
        <Pressable
          style={[
            styles.categoryItem,
            selectedCategory === null && styles.selectedCategory,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryIcon,
              selectedCategory === null && styles.selectedCategoryText,
            ]}
          >
            🌾
          </Text>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.name && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text
              style={[
                styles.categoryIcon,
                selectedCategory === category.name &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.icon}
            </Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Featured Products */}
      <Text style={styles.sectionTitle}>
        {searchQuery || selectedCategory
          ? "Search Results"
          : "Featured Products"}
        {filteredProducts.length > 0 && ` (${filteredProducts.length})`}
      </Text>
      <FlatList
        data={filteredProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() =>
              navigation.navigate("ProductDetails", { product: item })
            }
          >
            {item.image && item.image.data ? (
              <Image
                source={{ uri: getImageUri(item) }}
                style={styles.productImage}
                resizeMode="cover"
                onError={() => {
                  console.log("Image failed to load for product:", item._id);
                }}
                onLoad={() => {
                  console.log(
                    "Image loaded successfully for product:",
                    item._id
                  );
                }}
              />
            ) : (
              <Image
                source={require("../fresh.jpg")}
                style={styles.productImage}
              />
            )}

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
    // paddingTop: 10,
  },
  searchContainer: {
    marginVertical: 4,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 5,
    color: "#013220",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 8,
    color: "#013220",
    marginTop: 15,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 2,
  },
  categoryItem: {
    backgroundColor: "#FFF",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#013220",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedCategory: {
    backgroundColor: "#013220",
    borderColor: "#013220",
  },
  categoryIcon: {
    fontSize: 28,
    color: "#013220",
  },
  categoryText: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "center",
    color: "#013220",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#FFF",
  },
  productCard: {
    backgroundColor: "#FFF",
    width: "47%",
    height: 240,
    margin: 4,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    width: "100%",
    height: 70,
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#013220",
    marginBottom: 2,
    width: "100%",
  },
  productPrice: {
    fontSize: 13,
    color: "#013220",
    fontWeight: "600",
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 11,
    color: "#666",
    width: "100%",
    lineHeight: 14,
  },
  addButton: {
    backgroundColor: "#013220",
    borderRadius: 18,
    width: 32,
    height: 32,
    position: "absolute",
    bottom: 6,
    right: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 18,
  },
  cameraButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    backgroundColor: "#013220",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  shadow: {
    shadowColor: "#013220",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default UserScreen;
