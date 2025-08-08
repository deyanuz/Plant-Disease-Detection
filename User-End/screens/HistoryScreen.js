import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { AuthContext } from "../auth/AuthContext";

const HistoryScreen = () => {
  const [option, setOption] = useState("detections");
  const { userID } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const [detections, setDetections] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDetections();
  }, []);
  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchDetections = async () => {
    try {
      const response = await axios.get(
        `http://${IpAddress}:8000/${userID}/detections`
      );
      setDetections(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://${IpAddress}:8000/${userID}/orders`
      );
      setOrders(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const deleteHistory = async (id) => {
    try {
      const response = await axios.delete(
        `http://${IpAddress}:8000/${userID}/detections/delete/${id}`
      );

      if (response.status == 200) {
        console.log("History deleted successfully");
        alert("History deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("An error occurred while deleting history.");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <View
          style={[styles.tabItem, option === "detections" && styles.activeTab]}
        >
          <Pressable onPress={() => setOption("detections")}>
            <Text
              style={[
                styles.tabText,
                option === "detections" && styles.activeTabText,
              ]}
            >
              Detections ({detections.length ? detections.length : 0})
            </Text>
          </Pressable>
        </View>
        <View style={[styles.tabItem, option === "orders" && styles.activeTab]}>
          <Pressable onPress={() => setOption("orders")}>
            <Text
              style={[
                styles.tabText,
                option === "orders" && styles.activeTabText,
              ]}
            >
              Orders ({orders.length ? orders.length : 0})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {option == "detections" && (
            <View>
              {detections.length > 0 &&
                detections?.map((item, index) => (
                  <Pressable
                    key={index}
                    style={{
                      padding: 10,
                      backgroundColor: "white",
                      marginVertical: 10,
                      flexDirection: "row",
                      borderRadius: 6,
                    }}
                  >
                    <View
                      style={{
                        padding: 2,
                        marginRight: 15,
                      }}
                    >
                      <Image
                        style={{
                          width: 70,
                          height: 70,
                          borderWidth: 2,
                          borderColor: "#c518f0",
                          borderRadius: 5,
                        }}
                        source={{ uri: item.image }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 13,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text>Condition: {item?.predictionClass}</Text>
                          <Text>Confidence: {item?.confidence}</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          height: 1,
                          borderColor: "#e0e0e0",
                          borderWidth: 1,
                          marginVertical: 10,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 12,
                        }}
                      >
                        <Pressable
                          onPress={() => deleteHistory(item?._id)}
                          style={{
                            padding: 10,
                            borderRadius: 6,
                            backgroundColor: "#ff0000",
                            width: 100,
                          }}
                        >
                          <Text style={{ textAlign: "center", color: "white" }}>
                            Delete
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>
          )}

          {option == "orders" && (
            <View>
              {orders.length > 0 &&
                orders?.map((item, index) => (
                  <Pressable key={index} style={styles.orderCard}>
                    <View style={styles.orderContent}>
                      <View style={styles.orderHeader}>
                        <View style={styles.orderInfo}>
                          <Text style={styles.orderLabel}>ORDER ID</Text>
                          <Text style={styles.orderId}>{item?._id}</Text>
                        </View>
                        <View style={styles.orderStatus}>
                          <Text style={styles.statusLabel}>STATUS</Text>
                          <Text
                            style={[
                              styles.statusText,
                              item?.status === "Delivered"
                                ? styles.deliveredStatus
                                : styles.pendingStatus,
                            ]}
                          >
                            {item?.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderDetails}>
                        <View>
                          <Text style={styles.totalLabel}>TOTAL</Text>
                          <Text style={styles.totalAmount}>
                            ${item?.totalAmount}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.orderActions}>
                        <Pressable
                          style={styles.viewDetailsButton}
                          onPress={() =>
                            navigation.navigate("OrderScreen", { order: item })
                          }
                        >
                          <Text style={styles.viewDetailsText}>
                            View Details
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#056608",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 15,
    marginBottom: 40,
  },
  contentContainer: {
    flex: 1,
  },
  detectionCard: {
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detectionContent: {
    padding: 15,
  },
  detectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detectionInfo: {
    flex: 1,
  },
  detectionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detectionId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  detectionStatus: {
    alignItems: "flex-end",
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  detectionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#056608",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  orderCard: {
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderContent: {
    padding: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  pendingStatus: {
    color: "#FFA000",
  },
  deliveredStatus: {
    color: "#4CAF50",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c518f0",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewDetailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#013220",
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
