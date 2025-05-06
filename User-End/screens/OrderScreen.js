import { Pressable, Text, View, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";

const OrderScreen = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{order._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                { color: order.status === "completed" ? "#4CAF50" : "#FFA000" },
              ]}
            >
              {order.status}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>${order.totalAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.products?.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{order.shippingAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{order.contactNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: "#666",
    fontSize: 14,
  },
  value: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemQuantity: {
    color: "#666",
    fontSize: 14,
  },
  itemPrice: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OrderScreen;
