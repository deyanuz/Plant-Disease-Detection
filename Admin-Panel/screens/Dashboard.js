import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from "../styles/theme";
import ScreenHeader from "../components/ScreenHeader";
import Card from "../components/Card";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = `http://${IpAddress}:9000`;

const Dashboard = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { setToken } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    notifications: 0,
  });

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const analyticsCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: "people-outline",
      color: COLORS.analyticsCards.admins,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "cube-outline",
      color: COLORS.analyticsCards.products,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "cart-outline",
      color: COLORS.analyticsCards.orders,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "person-outline",
      color: COLORS.analyticsCards.users,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "time-outline",
      color: COLORS.warning,
    },
    {
      title: "Notifications",
      value: stats.notifications,
      icon: "notifications-outline",
      color: COLORS.error,
    },
  ];

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <ScreenHeader
            title="Dashboard"
            leftIcon="menu-outline"
            onLeftPress={() => navigation.openDrawer()}
          />
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.adminName}>Admin</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.analyticsGrid}>
            {analyticsCards.map((card, index) => (
              <Card
                key={index}
                style={[styles.analyticsCard, { backgroundColor: card.color }]}
              >
                <Ionicons name={card.icon} size={24} color={COLORS.white} />
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardValue}>{card.value}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>
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
  headerSection: {
    paddingTop: SIZES.padding,
  },
  welcomeSection: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.base,
  },
  welcomeText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  adminName: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding,
    paddingTop: SIZES.padding / 2,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  analyticsCard: {
    width: "47%",
    alignItems: "center",
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  cardTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginTop: SIZES.base,
    textAlign: "center",
  },
  cardValue: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginTop: SIZES.base / 2,
  },
});

export default Dashboard;
