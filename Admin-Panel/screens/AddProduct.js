import React, { useState, useEffect } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from "../styles/theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenHeader from "../components/ScreenHeader";

const BASE_URL = `http://${IpAddress}:9000`;

// Predefined categories
const CATEGORIES = ["Jute", "Corn", "Rice", "Other"];

const AddProduct = ({ navigation }) => {
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [imageBuffer, setImageBuffer] = useState(null);
  const [contentType, setContentType] = useState("");

  // Dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

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
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);

        // Upload the image to server
        await uploadImageToServer(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImageToServer = async (imageAsset) => {
    try {
      console.log("Uploading image:", imageAsset.uri);

      // Create form data
      const formData = new FormData();
      formData.append("image", {
        uri: imageAsset.uri,
        type: "image/jpeg",
        name: "product-image.jpg",
      });

      const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        console.log("Image uploaded successfully");
        setImageBuffer(response.data.imageBuffer);
        setContentType(response.data.contentType);
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

      // Check if image is uploaded
      if (!imageBuffer || !contentType) {
        Alert.alert("Error", "Please upload a product image!");
        return;
      }

      setIsSubmitting(true);

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim(),
        stock: stockNum,
        imageBuffer: imageBuffer,
        contentType: contentType,
      };

      console.log("Sending product data:", {
        ...productData,
        imageBuffer: "base64_data_here", // Don't log the actual buffer
      });
      const response = await axios.post(`${BASE_URL}/products`, productData);
      console.log("Server response:", response.data);

      Alert.alert(
        "Success",
        "Product added successfully! You can view it in the Products tab.",
        [
          {
            text: "View Products",
            onPress: () => navigation.navigate("Products"),
          },
          {
            text: "Add Another",
            style: "cancel",
          },
        ]
      );

      // Clear form
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImage(null);
      setImageBuffer(null);
      setContentType("");
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
          ? error.response.data.details.join(", ")
          : error.response.data.details;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
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

              {/* Category Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                >
                  <Text
                    style={[
                      styles.dropdownButtonText,
                      !category && styles.placeholderText,
                    ]}
                  >
                    {category || "Select Category"}
                  </Text>
                  <Ionicons
                    name={
                      isCategoryDropdownOpen ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>

                {isCategoryDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.dropdownItem,
                          category === cat && styles.selectedDropdownItem,
                        ]}
                        onPress={() => selectCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            category === cat && styles.selectedDropdownItemText,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

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
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                >
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.imagePickerText}>
                    {imageBuffer ? "Change Image" : "Pick an Image"}
                  </Text>
                </TouchableOpacity>
                {image && image.uri && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        setImage(null);
                        setImageBuffer(null);
                        setContentType("");
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  isSubmitting && styles.disabledButton,
                ]}
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
        {imageBuffer && <View style={{ margin: 25 }} />}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
    fontWeight: "bold",
    marginBottom: SIZES.padding,
    color: COLORS.blak,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    fontSize: SIZES.font,
  },
  dropdownContainer: {
    marginBottom: SIZES.padding,
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  dropdownButtonText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    marginTop: 2,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedDropdownItem: {
    backgroundColor: COLORS.primary,
  },
  dropdownItemText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  selectedDropdownItemText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: "bold",
  },
  imageSection: {
    marginBottom: SIZES.padding,
  },
  imageLabel: {
    fontSize: SIZES.font,
    fontWeight: "bold",
    marginBottom: SIZES.base,
    color: COLORS.text,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  imagePickerText: {
    marginLeft: SIZES.base,
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginTop: SIZES.padding,
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  imageNote: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});

export default AddProduct;
