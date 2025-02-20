import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenHeader from '../components/ScreenHeader';

const BASE_URL = `http://${IpAddress}:9000`;

const AddProduct = ({ navigation }) => {
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

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

  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
      Alert.alert("Error", "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!name || !price || !category) {
        Alert.alert("Error", "Name, price, and category are required!");
        return;
      }

      // Validate price and stock
      const priceNum = parseFloat(price);
      const stockNum = parseInt(stock) || 0;

      if (isNaN(priceNum) || priceNum < 0) {
        Alert.alert("Error", "Please enter a valid price");
        return;
      }

      if (isNaN(stockNum) || stockNum < 0) {
        Alert.alert("Error", "Please enter a valid stock number");
        return;
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim(),
        stock: stockNum,
      };

      console.log("Sending product data:", productData);
      const response = await axios.post(`${BASE_URL}/products`, productData);
      console.log("Server response:", response.data);

      Alert.alert("Success", "Product added successfully!");
      // Clear form
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to add product. Please try again."
      );
    }
  };

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
      console.error(err);
      Alert.alert("Error", "Failed to update product.");
    }
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
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDetails}>Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.productDetails}>Category: {item.category}</Text>
      <Text style={styles.productDetails}>Stock: {item.stock}</Text>
      {item.description && (
        <Text style={styles.productDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="Add Product"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />
        <View style={styles.content}>
          {/* Add Product Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              value={stock}
              keyboardType="numeric"
              onChangeText={setStock}
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddProduct}
            >
              <Text style={styles.buttonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Product List */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Product List</Text>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={renderProductCard}
                ListEmptyComponent={
                  <Text style={styles.emptyMessage}>No products available.</Text>
                }
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Update Product Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Update Product</Text>
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
              keyboardType="numeric"
              onChangeText={setUpdatedPrice}
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
              keyboardType="numeric"
              onChangeText={setUpdatedStock}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveUpdatedProduct}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    fontSize: SIZES.font,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.text,
  },
  listContentContainer: {
    paddingBottom: 20, // Add padding at the bottom of the list
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
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
  productCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
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
});

export default AddProduct;
