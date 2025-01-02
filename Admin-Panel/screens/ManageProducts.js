import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  Modal,
  TextInput,
  Button,
} from "react-native";
import axios from "axios";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [updatedStock, setUpdatedStock] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch Products from Server
  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get("http://192.168.0.101:9000/products"); // Replace with your server URL
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
      Alert.alert("Error", "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://192.168.0.101:9000/products/${id}`); // Replace with your server URL
      Alert.alert("Success", "Product deleted successfully!");
      fetchProducts(); // Refresh products
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete product.");
    }
  };

  // Handle Open Update Modal
  const handleUpdateProduct = (product) => {
    setSelectedProduct(product);
    setUpdatedName(product.name);
    setUpdatedPrice(product.price.toString());
    setUpdatedStock(product.stock.toString());
    setModalVisible(true);
  };

  // Handle Save Updated Product
  const saveUpdatedProduct = async () => {
    try {
      const response = await axios.put(
        `http://192.168.0.101:9000/products/${selectedProduct._id}`, // Replace with your server URL
        {
          name: updatedName,
          price: parseFloat(updatedPrice),
          stock: parseInt(updatedStock),
        }
      );
      Alert.alert("Success", "Product updated successfully!");
      setModalVisible(false);
      fetchProducts(); // Refresh products
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update product.");
    }
  };

  // Render Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products available.</Text>
    </View>
  );

  // Render Product Card
  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        Alert.alert(
          "Product Options",
          `Choose an action for ${item.name}`,
          [
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
          ]
        )
      }
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDetails}>Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.productDetails}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Manage Products</Text>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load products.</Text>
          <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product List */}
      {!loading && !error && (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProductCard}
          ListEmptyComponent={renderEmptyState} // Show if list is empty
        />
      )}

      {/* Update Product Modal */}
      {selectedProduct && (
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Update Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={updatedName}
              onChangeText={setUpdatedName}
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
              placeholder="Stock"
              value={updatedStock}
              keyboardType="numeric"
              onChangeText={setUpdatedStock}
            />
            <Button title="Save" onPress={saveUpdatedProduct} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  productCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productDetails: {
    fontSize: 14,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default ManageProducts;
