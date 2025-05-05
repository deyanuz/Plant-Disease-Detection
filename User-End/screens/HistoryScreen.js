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
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <View
          style={{
            marginTop: 5,
            padding: 10,
            paddingTop: 0,
            width: "50%",
            alignItems: "center",
            borderBottomWidth: option == "detections" ? 2 : 0,
            borderRightWidth: option == "detections" ? 1 : 0,
            borderRightColor: "#9d23bc80",
            borderBottomColor: "#9d23bc",
            gap: 15,
          }}
        >
          <Pressable onPress={() => setOption("detections")}>
            <Text
              style={{
                color: option == "detections" ? "#9d23bc" : "gray",
                fontWeight: "500",
              }}
            >
              Detections ({detections.length ? detections.length : 0})
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            marginTop: 5,
            padding: 10,
            paddingTop: 0,
            width: "50%",
            alignItems: "center",
            borderBottomWidth: option == "orders" ? 2 : 0,
            borderLeftWidth: option == "orders" ? 1 : 0,
            borderLeftColor: "#9d23bc80",
            borderBottomColor: "#9d23bc",
            gap: 15,
          }}
        >
          <Pressable onPress={() => setOption("orders")}>
            <Text
              style={{
                color: option == "orders" ? "#9d23bc" : "gray",
                fontWeight: "500",
              }}
            >
              Orders ({orders.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ marginTop: 10, marginHorizontal: 15, marginBottom: 40 }}
      >
        <View>
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
                            backgroundColor: "#c518f0",
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
        </View>
      </ScrollView>
      <ScrollView
        style={{ marginHorizontal: 15, marginTop: 10, marginBottom: 40 }}
      >
        <View>
          {option == "orders" && (
            <View>
              {orders.length > 0 &&
                orders?.map((item, index) => (
                  <Pressable
                    key={index}
                    style={{
                      padding: 15,
                      backgroundColor: "white",
                      marginVertical: 8,
                      borderRadius: 12,
                      elevation: 3,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 13,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: "#666" }}>
                            ORDER ID
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "500",
                              marginBottom: 8,
                            }}
                          >
                            {item?._id}
                          </Text>

                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <View>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                STATUS
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "500",
                                  color:
                                    item?.status === "completed"
                                      ? "#4CAF50"
                                      : "#FFA000",
                                }}
                              >
                                {item?.status}
                              </Text>
                            </View>

                            <View>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                TOTAL
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "600",
                                  color: "#c518f0",
                                }}
                              >
                                ${item?.totalAmount}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#f0f0f0",
                          marginVertical: 12,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Pressable
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            backgroundColor: "#c518f0",
                            minWidth: 120,
                          }}
                          onPress={() =>
                            navigation.navigate("OrderScreen", { order: item })
                          }
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              color: "white",
                              fontSize: 14,
                              fontWeight: "500",
                            }}
                          >
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

const styles = StyleSheet.create({});
