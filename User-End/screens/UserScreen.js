import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";
import { StyleSheet, Text, View, FlatList, Image, TextInput, Pressable } from "react-native";

const UserScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);

  const categories = [
    { id: 1, name: "Jute", icon: "🌾" },
    { id: 2, name: "Tomato", icon: "🍅" },
    { id: 3, name: "Strawberry", icon: "🍓" },
    { id: 4, name: "Potato", icon: "🥔" },
  ];

  // Simulate fetching JSON data
  useEffect(() => {
    const fetchProducts = async () => {
      const data = [
        {
          id: 1,
          name: "Rice Seeds",
          price: "$20.99/Kg",
          image: "https://media.istockphoto.com/id/1681725184/photo/rice.jpg?s=2048x2048&w=is&k=20&c=Ibpv_PUMmFVmi1yqeGt4D3hK4hg0Jus4uczuCVu0cNY=",
          description: "High-quality rice seeds for better yield.",
        },
        {
          id: 2,
          name: "Jute Seeds",
          price: "$13.99/Kg",
          image: "https://media.istockphoto.com/id/1433096076/photo/soybean-grain-in-a-hands-of-successful-farmer.jpg?s=2048x2048&w=is&k=20&c=8XLqWLjlZA4sTgEyKEEVb9-Uq9O4eBG4zG4Iuru2EBg=",
          description: "Best jute seeds for your farming needs.",
        },
        {
          id: 3,
          name: "Strawberry Seeds",
          price: "$24.99/Kg",
          image: "https://media.istockphoto.com/id/1157946861/photo/red-berry-strawberry-isolated.jpg?s=2048x2048&w=is&k=20&c=1E-5CHWTvhWJPt7M9TfSYUwZE3_WRvmLobGDRlHRQ-U=",
          description: "Premium strawberry seeds for delicious fruits.",
        },
        {
          id: 4,
          name: "Tomato Seeds",
          price: "$28.99/Kg",
          image: "https://media.istockphoto.com/id/1320269431/photo/tomato-seed-collection.jpg?s=1024x1024&w=is&k=20&c=4uSQMx_1Q7a4MA4J5aq3ECOpKOX9sjqsbFuztK1MK38=",
          description: "Grow juicy tomatoes with these seeds.",
        },
        {
          id: 5,
          name: "Potato Seeds",
          price: "$15.99/Kg",
          image: "https://media.istockphoto.com/id/1459660565/photo/manual-planting-of-potato-tubers-in-the-ground-early-spring-preparation-for-the-garden-season.jpg?s=2048x2048&w=is&k=20&c=QSLciCCbCJG2iZxroqlyMmYZH2l-cHWLwxP3mh4x8tU=",
          description: "Potato seeds for the best crops.",
        },
        {
          id: 6,
          name: "Potato Seeds",
          price: "$15.99/Kg",
          image: "https://media.istockphoto.com/id/1459660565/photo/manual-planting-of-potato-tubers-in-the-ground-early-spring-preparation-for-the-garden-season.jpg?s=2048x2048&w=is&k=20&c=QSLciCCbCJG2iZxroqlyMmYZH2l-cHWLwxP3mh4x8tU=",
          description: "Potato seeds for the best crops.",
        },
      ];
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="magnifying-glass" size={20} color="#888" style={styles.searchIcon} />
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
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() => navigation.navigate("ProductDetails", { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
            <Pressable
              style={styles.addButton}
              onPress={() => alert(`${item.name} added to cart`)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  searchIcon: {
    marginRight: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryItem: {
    backgroundColor: "#FFF",
    width: 80,
    height: 80,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 30,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },
  productCard: {
    backgroundColor: "#FFF",
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: "flex-start", // Aligns items slightly to the left
    elevation: 3,
    position: "relative",
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center", // Keeps the image centered horizontally
  },
  productInfo: {
    alignItems: "flex-start", // Align name and price to the left
    marginVertical: 5,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 12,
    color: "green",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#013220",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    bottom: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserScreen;