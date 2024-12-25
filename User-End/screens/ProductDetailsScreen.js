import React, { useState } from "react";
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

const ProductDetailsScreen = ({ route }) => {
  const { product } = route.params;
  const navigation = useNavigation();
  const [rating, setRating] = useState(4); // Default rating

  const relatedProducts = [
    {
      id: 1,
      name: "Rice Seeds",
      price: "₹20.99",
      image:
        "https://media.istockphoto.com/id/1681725184/photo/rice.jpg?s=2048x2048&w=is&k=20&c=Ibpv_PUMmFVmi1yqeGt4D3hK4hg0Jus4uczuCVu0cNY=",
    },
    {
      id: 2,
      name: "Jute Seeds",
      price: "₹13.99",
      image:
        "https://media.istockphoto.com/id/1433096076/photo/soybean-grain-in-a-hands-of-successful-farmer.jpg?s=2048x2048&w=is&k=20&c=8XLqWLjlZA4sTgEyKEEVb9-Uq9O4eBG4zG4Iuru2EBg=",
    },
    {
      id: 3,
      name: "Strawberry Seeds",
      price: "₹24.99",
      image:
        "https://media.istockphoto.com/id/1157946861/photo/red-berry-strawberry-isolated.jpg?s=2048x2048&w=is&k=20&c=1E-5CHWTvhWJPt7M9TfSYUwZE3_WRvmLobGDRlHRQ-U=",
    },
    {
      id: 4,
      name: "Tomato Seeds",
      price: "₹28.99",
      image:
        "https://media.istockphoto.com/id/1320269431/photo/tomato-seed-collection.jpg?s=1024x1024&w=is&k=20&c=4uSQMx_1Q7a4MA4J5aq3ECOpKOX9sjqsbFuztK1MK38=",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: product.image }} style={styles.productImage} />

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
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
            };
            console.log("Navigating to Cart with:", cartItem); // Debug log
            navigation.navigate("Cart", { cartItems: [cartItem] });
          }}
        >
          <Text style={styles.addToBasketText}>Add to Basket</Text>
        </TouchableOpacity>
      </View>

      {/* Related Products */}
      <Text style={styles.sectionTitle}>Related Products</Text>
      <FlatList
        data={relatedProducts}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.relatedProductCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.relatedProductImage}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.relatedProductsContainer}
      />
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 5,
    alignItems: "center",
  },
  overlayText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
  },
});

export default ProductDetailsScreen;
