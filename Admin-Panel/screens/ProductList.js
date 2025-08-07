import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  RefreshControl,
} from "react-native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from "../styles/theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenHeader from "../components/ScreenHeader";

const BASE_URL = `http://${IpAddress}:9000`;

const ProductList = ({ navigation }) => {
  // Product list states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal states
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [updatedStock, setUpdatedStock] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add focus listener to refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProducts();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      console.log("Fetched products:", response.data);
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(true);
      Alert.alert("Error", "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/products/${id}`);
      Alert.alert("Success", "Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete product.");
    }
  };

  const handleUpdateProduct = (product) => {
    setSelectedProduct(product);
    setUpdatedName(product.name);
    setUpdatedDescription(product.description || "");
    setUpdatedPrice(product.price.toString());
    setUpdatedCategory(product.category);
    setUpdatedStock(product.stock.toString());
    setModalVisible(true);
  };

  const saveUpdatedProduct = async () => {
    try {
      await axios.put(`${BASE_URL}/products/${selectedProduct._id}`, {
        name: updatedName,
        description: updatedDescription,
        price: parseFloat(updatedPrice),
        category: updatedCategory,
        stock: parseInt(updatedStock),
      });
      Alert.alert("Success", "Product updated successfully!");
      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      console.error("Update error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage = "Failed to update product.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = Array.isArray(err.response.data.details)
          ? err.response.data.details.join(", ")
          : err.response.data.details;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  // Helper function to get image URI from buffer data
  const getImageUri = (product) => {
    if (product.image && product.image.data) {
      // If the product has buffer data, use the API endpoint to serve the image
      return `${BASE_URL}/product-image/${product._id}`;
    }
    return null;
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        Alert.alert("Product Options", `Choose an action for ${item.name}`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: () => handleDeleteProduct(item._id),
            style: "destructive",
          },
          {
            text: "Update",
            onPress: () => handleUpdateProduct(item),
          },
        ])
      }
    >
      <View style={styles.productCardContent}>
        {item.image && item.image.data ? (
          <Image
            source={{ uri: getImageUri(item) }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              console.log("Image failed to load for product:", item._id);
            }}
            onLoad={() => {
              console.log("Image loaded successfully for product:", item._id);
            }}
          />
        ) : (
          <View style={styles.defaultProductImage}>
            <Ionicons name="image-outline" size={30} color={COLORS.gray} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDetails}>
            Price: ${item.price.toFixed(2)}
          </Text>
          <Text style={styles.productDetails}>Category: {item.category}</Text>
          <Text style={styles.productDetails}>Stock: {item.stock}</Text>
          {item.description && (
            <Text style={styles.productDescription}>{item.description}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        {loading
          ? "Loading products..."
          : "There are no products in the database"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Product List"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
        rightIcon="refresh-outline"
        onRightPress={fetchProducts}
      />

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>All Products</Text>
          <Text style={styles.productCount}>{products.length} products</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={60}
              color={COLORS.error}
            />
            <Text style={styles.errorTitle}>Error Loading Products</Text>
            <Text style={styles.errorSubtitle}>
              Please check your connection and try again
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchProducts}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Update Product</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={updatedName}
                onChangeText={setUpdatedName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={updatedDescription}
                onChangeText={setUpdatedDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={updatedPrice}
                onChangeText={setUpdatedPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={updatedCategory}
                onChangeText={setUpdatedCategory}
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                value={updatedStock}
                onChangeText={setUpdatedStock}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveUpdatedProduct}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
  },
  productCount: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    ...FONTS.h2,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    ...FONTS.body3,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    ...FONTS.h2,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...FONTS.body3,
    color: COLORS.gray,
    textAlign: "center",
    opacity: 0.8,
  },
  separator: {
    height: 8,
  },
  productCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  productCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  defaultProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: COLORS.lightGray || "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    fontSize: SIZES.font,
  },
});

export default ProductList;
