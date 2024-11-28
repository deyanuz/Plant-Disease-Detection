import React, { useContext } from "react";

import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Avatar, Title, Caption } from "react-native-paper"; // For Avatar
import { useNavigation } from "@react-navigation/native"; // To navigate
import { AuthContext } from "../auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DrawerContent = (props) => {
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);
  const signOutAndClearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setToken("");
      Alert.alert("Success!", "Log out successful", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
        },
        { text: "OK", onPress: () => console.log("OK") },
      ]);
    } catch (error) {
      console.log("Error", error);
    } finally {
      if (!token) {
        navigation.replace("Login");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoSection}>
        <TouchableOpacity activeOpacity={0.8}>
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <Avatar.Image
              source={{
                uri: "",
              }}
              size={50}
            />
            <View style={{ marginLeft: 10 }}>
              <Title style={styles.title}>khan</Title>
              <Caption style={styles.caption}>khan@gmail.com</Caption>
            </View>
          </View>
        </TouchableOpacity>
      </View>
{/* Drawer Items */}
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerItems}>
          {/* Add your drawer screens here */}
          <TouchableOpacity
            onPress={() => {
              // You can navigate to other screens here if needed
              props.navigation.navigate("User");
            }}
          >
            <Text style={styles.drawerItem}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("Profile");
            }}
          >
            <Text style={styles.drawerItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("History");
            }}
          >
            <Text style={styles.drawerItem}>History</Text>
          </TouchableOpacity>
          {/* Sign-out button */}
          <TouchableOpacity
            onPress={signOutAndClearAuthToken}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    color: "gray",
  },
  drawerItems: {
    paddingTop: 20,
  },
  drawerItem: {
    fontSize: 16,
    padding: 10,
    color: "black",
  },
  signOutButton: {
    padding: 15,
    backgroundColor: "#013220",
    marginTop: 20,
    borderRadius: 10,
  },
  signOutText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DrawerContent;
