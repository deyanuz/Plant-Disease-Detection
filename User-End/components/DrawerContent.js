import React, { useContext } from "react";

import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Avatar, Title, Caption } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const DrawerContent = (props) => {
  const navigation = useNavigation();
  const { token, setToken, userImage, userEmail, userName } =
    useContext(AuthContext);
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
          <View style={styles.userInfoContent}>
            <Avatar.Image
              source={{
                uri: userImage,
              }}
              size={60}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Title style={styles.title} numberOfLines={1}>
                {userName}
              </Title>
              <Caption style={styles.caption} numberOfLines={1}>
                {userEmail}
              </Caption>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.drawerItems}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.navigate("User");
              }}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="person-outline" size={24} color="#013220" />
                <Text style={styles.menuItemText}>User</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.navigate("Profile");
              }}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="settings-outline" size={24} color="#013220" />
                <Text style={styles.menuItemText}>Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.navigate("History");
              }}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="time-outline" size={24} color="#013220" />
                <Text style={styles.menuItemText}>History</Text>
              </View>
            </TouchableOpacity>
          </View>

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
    alignItems: "left",
    justifyContent: "space-outer",
  },
  userInfoSection: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  userInfoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#0132",
  },
  userTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#013220",
  },
  caption: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  drawerItems: {
    paddingTop: 20,
    flex: 1,
    justifyContent: "space-between",
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
    marginBottom: 25,
  },
  signOutText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  menuContainer: {
    paddingHorizontal: 15,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#013220",
  },
});

export default DrawerContent;
