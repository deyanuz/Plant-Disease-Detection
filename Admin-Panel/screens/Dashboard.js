import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const Dashboard = () => {
  const features = [
    {
      id: 1,
      title: "Add Admin",
      icon: "person-add-outline",
      onPress: () => alert("Navigate to Add Admin"),
      color: "#FF6F61",
    },
    {
      id: 2,
      title: "Manage Products",
      icon: "cart-outline",
      onPress: () => alert("Navigate to Manage Products"),
      color: "#FFD966",
    },
    {
      id: 3,
      title: "User History",
      icon: "time-outline",
      onPress: () => alert("Navigate to User History"),
      color: "#6EB5FF",
    },
    {
      id: 4,
      title: "Manage Orders",
      icon: "clipboard-outline",
      onPress: () => alert("Navigate to Manage Orders"),
      color: "#71C567",
    },
  ];

  return (
    <LinearGradient
      colors={["#5A9", "#013220"]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.adminName}>Admin</Text>
          </View>
          <Ionicons name="person-circle-outline" size={50} color="#fff" />
        </View>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <View
            style={[styles.analyticsCard, { backgroundColor: "#FF6F61" }]}
          >
            <Text style={styles.analyticsTitle}>Active Admins</Text>
            <Text style={styles.analyticsValue}>5</Text>
          </View>
          <View
            style={[styles.analyticsCard, { backgroundColor: "#6EB5FF" }]}
          >
            <Text style={styles.analyticsTitle}>Orders</Text>
            <Text style={styles.analyticsValue}>120</Text>
          </View>
        </View>

        {/* Features Section */}
        <ScrollView contentContainerStyle={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                { backgroundColor: feature.color },
              ]}
              onPress={feature.onPress}
            >
              <Ionicons name={feature.icon} size={30} color="#fff" />
              <Text style={styles.featureText}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  analyticsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  analyticsCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  analyticsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  analyticsValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "47%",
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  featureText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default Dashboard;
