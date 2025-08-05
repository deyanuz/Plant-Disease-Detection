import React, { useContext, useState, useEffect } from "react";

import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { Avatar, Title, Caption } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const DrawerContent = (props) => {
  const navigation = useNavigation();
  const { token, setToken, userImage, userEmail, userName } =
    useContext(AuthContext);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch agricultural news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // Using NewsAPI - you'll need to get a free API key from https://newsapi.org/
      const response = await fetch(
        "https://newsapi.org/v2/everything?q=agriculture+farming&language=en&sortBy=publishedAt&pageSize=10&apiKey=42d51b7447344870a8679ec541b64274"
      );
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      }
    } catch (error) {
      console.log("News fetch error:", error);
      // Fallback news data
      setNews([
        {
          title: "Latest in Agriculture",
          description:
            "Stay updated with farming innovations and sustainable practices",
          url: "https://www.fao.org/agriculture/en/",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openAgriArticle = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      // Fallback to FAO website
      Linking.openURL("https://www.fao.org/agriculture/en/");
    }
  };

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
          {/* Agricultural News Widget */}
          <View style={styles.widgetContainer}>
            <View style={styles.widgetHeader}>
              <Ionicons name="leaf-outline" size={20} color="#013220" />
              <Text style={styles.widgetTitle}>Agriculture News</Text>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Loading latest news...</Text>
            ) : news && news.length > 0 ? (
              <ScrollView
                style={styles.newsScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {news.map((article, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.articleButton}
                    onPress={() => openAgriArticle(article.url)}
                  >
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.articleDesc} numberOfLines={2}>
                      {article.description ||
                        "Latest farming insights and guides"}
                    </Text>
                    <View style={styles.articleLink}>
                      <Text style={styles.linkText}>Read Full Article</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#013220"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={styles.articleButton}
                onPress={() => openAgriArticle()}
              >
                <Text style={styles.articleTitle}>Latest in Agriculture</Text>
                <Text style={styles.articleDesc}>
                  Stay updated with farming innovations
                </Text>
                <View style={styles.articleLink}>
                  <Text style={styles.linkText}>Read More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#013220" />
                </View>
              </TouchableOpacity>
            )}
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
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 10,
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
  // Widget Styles
  widgetContainer: {
    backgroundColor: "#f8f8f8",
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 10,
    borderWidth: 0,
    borderColor: "#e0e0e0",
    borderRadius: 10,
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#013220",
    marginLeft: 8,
  },
  articleButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#013220",
    marginBottom: 4,
  },
  articleDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  articleLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkText: {
    fontSize: 12,
    color: "#013220",
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  newsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default DrawerContent;
