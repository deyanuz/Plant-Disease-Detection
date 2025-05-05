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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenHeader from "../components/ScreenHeader";
import Card from "../components/Card";
import { COLORS, SIZES, FONTS, SHADOWS } from "../styles/theme";
import axios from "axios";
import IpAddress from "../DeviceConfig";

const BASE_URL = `http://${IpAddress}:9000`;

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const ManageOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${BASE_URL}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
        status: newStatus,
      });
      Alert.alert("Success", "Order status updated successfully!");
      setModalVisible(false);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "confirmed":
        return "#3498db";
      case "processing":
        return "#9b59b6";
      case "shipped":
        return "#2ecc71";
      case "delivered":
        return "#27ae60";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const renderOrderCard = ({ item }) => (
    <Card>
      <TouchableOpacity
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.customerName}>
            Customer: {item.customerName || "N/A"}
          </Text>
          <Text style={styles.orderDate}>
            Date: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.totalAmount}>
            Total: ${item.totalAmount?.toFixed(2)}
          </Text>
          <Text style={styles.productDetails}>Products:</Text>
          {item.products.map((product) => (
            <Text key={product._id} style={styles.productText}>
              {product.name} - Qty: {product.quantity} - Price: ${product.price.toFixed(2)}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderStatusUpdateModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>
            Update Order Status
          </Text>
          <Text style={styles.modalOrderId}>
            Order #{selectedOrder?._id.slice(-6)}
          </Text>

          <View style={styles.statusButtonsContainer}>
            {ORDER_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor: getStatusColor(status),
                    opacity:
                      selectedOrder?.status === status ? 0.6 : 1,
                  },
                ]}
                onPress={() => handleUpdateStatus(selectedOrder._id, status)}
                disabled={selectedOrder?.status === status}
              >
                <Text style={styles.statusButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load orders</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Orders"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />

        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No orders available</Text>
          }
        />

        {renderStatusUpdateModal()}
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
  },
  listContainer: {
    padding: SIZES.padding,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  orderId: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  statusText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  orderDetails: {
    marginBottom: SIZES.margin,
  },
  customerName: {
    fontSize: SIZES.font,
    color: "black",
    marginBottom: SIZES.base,
  },
  orderDate: {
    fontSize: SIZES.font,
    color: "#000",
    marginBottom: SIZES.base,
  },
  totalAmount: {
    fontSize: SIZES.font,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: SIZES.extraLarge,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SIZES.margin,
  },
  modalOrderId: {
    fontSize: SIZES.font,
    textAlign: "center",
    color: "#666",
    marginBottom: SIZES.margin,
  },
  statusButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SIZES.margin,
  },
  statusButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    minWidth: "45%",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: SIZES.font,
    color: "#e74c3c",
    marginBottom: SIZES.margin,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: SIZES.font,
    color: "#666",
    marginTop: SIZES.margin,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productDetails: {
    fontSize: SIZES.font,
    fontWeight: "bold",
    marginTop: SIZES.base,
    color: "black",
  },
  productText: {
    fontSize: SIZES.font,
    color: "black",
    marginBottom: SIZES.base,
  },
});

export default ManageOrders;
