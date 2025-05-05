import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';

const BASE_URL = `http://${IpAddress}:9000`;

const ManageProducts = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <Card style={styles.productCard}>
      <View style={styles.productContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Manage Products"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
      />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No products available</Text>
            )}
          />
        )}
      </View>
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
  listContainer: {
    paddingBottom: SIZES.padding,
  },
  productCard: {
    marginBottom: SIZES.padding,
  },
  productContent: {
    padding: SIZES.padding,
  },
  productName: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  productPrice: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: SIZES.padding,
  },
});

export default ManageProducts;
