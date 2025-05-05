import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { AuthContext } from "../auth/AuthContext";

const HistoryScreen = () => {
  const [option, setOption] = useState("detections");
  const { userID } = useContext(AuthContext);
  const route = useRoute();
  const [detections, setDetections] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchDetections();
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [products]);
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

  const fetchProducts = async () => {
    try {
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

  console.log(detections);
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
            borderBottomWidth: option == "products" ? 2 : 0,
            borderLeftWidth: option == "products" ? 1 : 0,
            borderLeftColor: "#9d23bc80",
            borderBottomColor: "#9d23bc",
            gap: 15,
          }}
        >
          <Pressable onPress={() => setOption("products")}>
            <Text
              style={{
                color: option == "products" ? "#9d23bc" : "gray",
                fontWeight: "500",
              }}
            >
              Products ({products.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 10, marginHorizontal: 15 }}>
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
      </View>
      <View style={{ marginHorizontal: 15, marginTop: 10 }}>
        <View>
          {option == "products" && (
            <View>
              {products.map((item, index) => (
                <Pressable
                  key={index}
                  style={{
                    marginVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View>
                    <Image
                      style={{
                        width: 60,
                        height: 60,
                        resizeMode: "contain",
                        borderRadius: 30,
                      }}
                      source={{ uri: item?.image }}
                    />
                  </View>
                  <View>
                    <Text>
                      {item?.firstName} {item?.lastName}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginTop: 10,
                        borderRadius: 20,
                        borderColor: "#fcf005",
                        borderWidth: 1,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text>INTERMIDEATE</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
const styles = StyleSheet.create({});

