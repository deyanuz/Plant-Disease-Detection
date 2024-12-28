import React, { useContext } from "react";
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
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../auth/AuthContext";

const Dashboard = ({ navigation }) => {
  const { setToken } = useContext(AuthContext);

  const handleLogout = async () => {
    setToken("");
    alert("Successfully logged out!");
    navigation.replace("Login");
  };

  const actions = [
    {
      id: "1",
      title: "Add Admin",
      icon: "person-add-outline",
      onPress: () => navigation.navigate("AddAdmin"),
    },
    {
      id: "2",
      title: "Manage Products",
      icon: "cart-outline",
      onPress: () => navigation.navigate("ManageProducts"),
    },
    {
      id: "3",
      title: "Remove Products",
      icon: "trash-outline",
      onPress: () => navigation.navigate("RemoveProducts"),
    },
    {
      id: "4",
      title: "Manage Orders",
      icon: "clipboard-outline",
      onPress: () => navigation.navigate("ManageOrders"),
    },
  ];

  return (
    <LinearGradient
      colors={["#013220", "#1D8348"]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Admin</Text>
          <View style={styles.profileWrapper}>
            <Text style={styles.profileName}>Admin Name</Text>
            <Ionicons name="person-circle-outline" size={40} color="#fff" />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.actionContainer}>
          {actions.map((action) => (
            <Animatable.View
              key={action.id}
              animation="fadeInUp"
              duration={1000}
              delay={action.id * 200}
            >
              <TouchableOpacity style={styles.card} onPress={action.onPress}>
                <Ionicons name={action.icon} size={30} color="#fff" />
                <Text style={styles.cardText}>{action.title}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Add styles here
});

export default Dashboard;
