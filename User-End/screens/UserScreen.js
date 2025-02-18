import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";
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

const UserScreen = () => {
  const navigation = useNavigation();
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
          image:
            "https://media.istockphoto.com/id/1681725184/photo/rice.jpg?s=2048x2048&w=is&k=20&c=Ibpv_PUMmFVmi1yqeGt4D3hK4hg0Jus4uczuCVu0cNY=",
          description: "High-quality rice seeds for better yield.",
        },
        {
          id: 2,
          name: "Jute Seeds",
          price: "$13.99/Kg",
          image:
            "https://media.istockphoto.com/id/1433096076/photo/soybean-grain-in-a-hands-of-successful-farmer.jpg?s=2048x2048&w=is&k=20&c=8XLqWLjlZA4sTgEyKEEVb9-Uq9O4eBG4zG4Iuru2EBg=",
          description: "Best jute seeds for your farming needs.",
        },
        {
          id: 3,
          name: "Strawberry Seeds",
          price: "$24.99/Kg",
          image:
            "https://media.istockphoto.com/id/1157946861/photo/red-berry-strawberry-isolated.jpg?s=2048x2048&w=is&k=20&c=1E-5CHWTvhWJPt7M9TfSYUwZE3_WRvmLobGDRlHRQ-U=",
          description: "Premium strawberry seeds for delicious fruits.",
        },
        {
          id: 4,
          name: "Tomato Seeds",
          price: "$28.99/Kg",
          image:
            "https://media.istockphoto.com/id/1320269431/photo/tomato-seed-collection.jpg?s=1024x1024&w=is&k=20&c=4uSQMx_1Q7a4MA4J5aq3ECOpKOX9sjqsbFuztK1MK38=",
          description: "Grow juicy tomatoes with these seeds.",
        },
        {
          id: 5,
          name: "Potato Seeds",
          price: "$15.99/Kg",
          image:
            "https://media.istockphoto.com/id/1459660565/photo/manual-planting-of-potato-tubers-in-the-ground-early-spring-preparation-for-the-garden-season.jpg?s=2048x2048&w=is&k=20&c=QSLciCCbCJG2iZxroqlyMmYZH2l-cHWLwxP3mh4x8tU=",
          description: "Potato seeds for the best crops.",
        },
        {
          id: 6,
          name: "Potato Seeds",
          price: "$15.99/Kg",
          image:
            "https://media.istockphoto.com/id/1459660565/photo/manual-planting-of-potato-tubers-in-the-ground-early-spring-preparation-for-the-garden-season.jpg?s=2048x2048&w=is&k=20&c=QSLciCCbCJG2iZxroqlyMmYZH2l-cHWLwxP3mh4x8tU=",
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
          <Icon
            name="magnifying-glass"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
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
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.productCard}
            onPress={() =>
              navigation.navigate("ProductDetails", { product: item })
            }
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
    borderColor: "#013220",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  searchIcon: {
    marginRight: 5,
    color: "#013220",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#013220",
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
    shadowColor: "#013220",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#013220",
  },
  categoryIcon: {
    fontSize: 30,
    color: "#013220",
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    color: "#013220",
  },
  productCard: {
    backgroundColor: "#FFF",
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: "flex-start",
    elevation: 3,
    position: "relative",
    borderWidth: 1,
    borderColor: "#013220",
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  productInfo: {
    alignItems: "flex-start",
    marginVertical: 5,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#013220",
  },
  productPrice: {
    fontSize: 12,
    color: "#013220",
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
    shadowColor: "#013220",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#013220",
  },
  shadow: {
    shadowColor: "#013220",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default UserScreen;
