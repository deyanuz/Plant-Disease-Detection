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
  Image,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
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
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Component mounted
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
        setImageUrl(result.assets[0].uri);
        
        // Upload the image to server
        await uploadImageToServer(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImageToServer = async (imageUri) => {
    try {
      console.log("Uploading image:", imageUri);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'product-image.jpg'
      });

      const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        console.log("Image uploaded successfully:", response.data.imageUrl);
        setImageUrl(response.data.imageUrl);
        Alert.alert("Success", "Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };



  const handleAddProduct = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
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

      setIsSubmitting(true);

      // Handle image URL - use uploaded image or placeholder
      let finalImageUrl = "";
      if (imageUrl && imageUrl.trim() !== "") {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          finalImageUrl = imageUrl;
        } else if (imageUrl.startsWith('file://')) {
          // If it's still a local file, use placeholder
          const productName = name.trim().toLowerCase().replace(/\s+/g, '-');
          finalImageUrl = `https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=${encodeURIComponent(productName)}`;
          console.log("Local file detected, using placeholder image");
        } else {
          finalImageUrl = imageUrl;
        }
      }

      // Generate a unique placeholder if no image
      if (!finalImageUrl || finalImageUrl.trim() === "") {
        const productName = name.trim().toLowerCase().replace(/\s+/g, '-');
        finalImageUrl = `https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=${encodeURIComponent(productName)}`;
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim(),
        stock: stockNum,
        image: finalImageUrl,
      };

      console.log("Sending product data:", productData);
      const response = await axios.post(`${BASE_URL}/products`, productData);
      console.log("Server response:", response.data);

      Alert.alert(
        "Success", 
        "Product added successfully! You can view it in the Products tab.",
        [
          {
            text: "View Products",
            onPress: () => navigation.navigate("Products")
          },
          {
            text: "Add Another",
            style: "cancel"
          }
        ]
      );
      
      // Clear form
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImage(null);
      setImageUrl("");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = "Failed to add product. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = Array.isArray(error.response.data.details) 
          ? error.response.data.details.join(', ')
          : error.response.data.details;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Add Product"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
      />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Product</Text>
            
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
              onChangeText={setPrice}
              keyboardType="numeric"
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
              onChangeText={setStock}
              keyboardType="numeric"
            />
            
            {/* Image Picker Section */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Product Image</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>
                  {imageUrl ? "Change Image" : "Pick an Image"}
                </Text>
              </TouchableOpacity>
              {imageUrl && imageUrl.trim() !== "" && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageUrl("");
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              )}
              
            </View>
            
            <TouchableOpacity 
              style={[styles.addButton, isSubmitting && styles.disabledButton]} 
              onPress={handleAddProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Add Product</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  formTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.blak,
    textAlign: 'center',
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
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: SIZES.padding,
  },
  imageLabel: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    color: COLORS.blak,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  imagePickerText: {
    marginLeft: SIZES.base,
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginTop: SIZES.padding,
    alignItems: 'center',
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  imageNote: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AddProduct;
