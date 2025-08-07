import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import IpAddress from "../DeviceConfig";
import axios from "axios";

const ProductDetailsScreen = ({ route }) => {
  const { product } = route.params;
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const [rating, setRating] = useState(4); // Default rating
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Helper function to get image URI from buffer data
  const getImageUri = (product) => {
    if (product.image && product.image.data) {
      // If the product has buffer data, use the API endpoint to serve the image
      return `http://${IpAddress}:8000/product-image/${product._id}`;
    }
    return null;
  };

  // Fetch related products of the same category
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoadingRelated(true);
        const response = await axios.get(`http://${IpAddress}:8000/products`);
        const allProducts = response.data;

        // Filter products of the same category, excluding the current product
        const sameCategoryProducts = allProducts.filter(
          (p) => p.category === product.category && p._id !== product._id
        );

        // Limit to 4 related products
        const limitedRelatedProducts = sameCategoryProducts.slice(0, 4);

        setRelatedProducts(limitedRelatedProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product && product.category) {
      fetchRelatedProducts();
    }
  }, [product]);

  const handleRelatedProductPress = (relatedProduct) => {
    navigation.replace("ProductDetails", { product: relatedProduct });
  };

  return (
    <View style={styles.container}>
      {/* Product Image */}
      {product.image && product.image.data ? (
        <Image
          source={{ uri: getImageUri(product) }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => {
            console.log("Image failed to load for product:", product._id);
          }}
          onLoad={() => {
            console.log("Image loaded successfully for product:", product._id);
          }}
        />
      ) : (
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      )}

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Rating:</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <FontAwesome
                  name="star"
                  size={24}
                  color={star <= rating ? "#FFD700" : "#E0E0E0"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.productAvailability}>Available in stock</Text>
        <Text style={styles.productDescription}>{product.description}</Text>

        {/* Add to Basket Button */}
        <TouchableOpacity
          style={styles.addToBasketButton}
          onPress={() => {
            const cartItem = {
              id: product._id || product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
            };
            addToCart(cartItem);
            // Optionally show a success message or navigate to cart
            console.log("Added to cart:", cartItem);
            navigation.navigate("Main");
          }}
        >
          <Text style={styles.addToBasketText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Related Products */}
      <Text style={styles.sectionTitle}>
        Related Products ({relatedProducts.length})
      </Text>
      {loadingRelated ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading related products...</Text>
        </View>
      ) : relatedProducts.length > 0 ? (
        <FlatList
          data={relatedProducts}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.relatedProductCard}
              onPress={() => handleRelatedProductPress(item)}
            >
              {item.image && item.image.data ? (
                <Image
                  source={{ uri: getImageUri(item) }}
                  style={styles.relatedProductImage}
                  resizeMode="cover"
                  onError={() => {
                    console.log(
                      "Related product image failed to load:",
                      item._id
                    );
                  }}
                />
              ) : (
                <Image
                  source={{ uri: item.image }}
                  style={styles.relatedProductImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{item.name}</Text>
                <Text style={styles.overlayPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.relatedProductsContainer}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noRelatedContainer}>
          <Text style={styles.noRelatedText}>No related products found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    color: "green",
    fontWeight: "bold",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: "row",
  },
  productAvailability: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 20,
  },
  addToBasketButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addToBasketText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginLeft: 15,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  noRelatedContainer: {
    padding: 20,
    alignItems: "center",
  },
  noRelatedText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  relatedProductsContainer: {
    paddingHorizontal: 10,
  },
  relatedProductCard: {
    width: 120,
    height: 170,
    marginHorizontal: 5,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    position: "relative",
  },
  relatedProductImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  overlayText: {
    color: "#FFF",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 2,
  },
  overlayPrice: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    opacity: 0.9,
  },
});

export default ProductDetailsScreen;
