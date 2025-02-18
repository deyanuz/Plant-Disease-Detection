import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";

const BASE_URL = "http://192.168.0.101:9000"; // Replace with your backend server address

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const handleAddProduct = async () => {
    try {
      if (!name || !price || !category) {
        Alert.alert("Error", "Name, price, and category are required!");
        return;
      }

      const response = await axios.post(`${BASE_URL}/products`, {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
      });

      Alert.alert("Success", "Product added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
    } catch (error) {
      console.error("Error adding product:", error.message);
      Alert.alert("Error", "Failed to add product.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Product</Text>
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
      <Button title="Add Product" onPress={handleAddProduct} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AddProduct;
