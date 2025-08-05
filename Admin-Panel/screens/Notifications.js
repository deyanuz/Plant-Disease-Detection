import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';
import Card from "../components/Card";
import ScreenHeader from '../components/ScreenHeader';

const BASE_URL = `http://${IpAddress}:9000`;

const Notifications = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${BASE_URL}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(true);
      Alert.alert("Error", "Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${BASE_URL}/notifications/${id}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Alert.alert("Error", "Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.isRead);
      await Promise.all(
        unreadNotifications.map(notif => 
          axios.put(`${BASE_URL}/notifications/${notif._id}/read`)
        )
      );
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      Alert.alert("Success", "All notifications marked as read!");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      Alert.alert("Error", "Failed to mark all notifications as read.");
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationColor = (type) => {
    switch(type) {
      case 'order':
        return '#2ecc71'; // Green
      case 'product':
        return '#3498db'; // Blue
      case 'admin':
        return '#9b59b6'; // Purple
      default:
        return COLORS.primary;
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
        return 'cart-outline';
      case 'product':
        return 'cube-outline';
      case 'admin':
        return 'person-outline';
      default:
        return 'notifications-outline';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      onPress={() => markAsRead(item._id)}
      style={styles.notificationCard}
    >
      <Card style={[
        styles.card,
        item.isRead && styles.readCard
      ]}>
        <View style={styles.notificationContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) }
          ]}>
            <Ionicons 
              name={getNotificationIcon(item.type)}
              size={24} 
              color={COLORS.white} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              item.isRead && styles.readTitle
            ]}>
              {item.title}
            </Text>
            <Text style={[
              styles.message,
              item.isRead && styles.readMessage
            ]}>
              {item.message}
            </Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScreenHeader
            title="Notifications"
            leftIcon="menu-outline"
            onLeftPress={() => navigation.openDrawer()}
          />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScreenHeader
            title="Notifications"
            leftIcon="menu-outline"
            onLeftPress={() => navigation.openDrawer()}
          />
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={50} color={COLORS.white} />
            <Text style={styles.errorText}>Failed to load notifications</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Notifications"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
          rightIcon={unreadCount > 0 ? "checkmark-done-outline" : undefined}
          onRightPress={unreadCount > 0 ? markAllAsRead : undefined}
        />
        
        <View style={styles.content}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="notifications-off-outline" 
                  size={50} 
                  color={COLORS.white} 
                />
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>
                 
                </Text>
              </View>
            )}
          />
        </View>
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
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
    minHeight: '100%',
  },
  notificationCard: {
    marginBottom: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  readCard: {
    backgroundColor: 'rgba(243, 235, 235, 0.9)',
    opacity: 0.8,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.black,
    marginBottom: 4,
    fontWeight: '600',
  },
  readTitle: {
    color: COLORS.black,
    fontWeight: 'normal',
  },
  message: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.black,
    marginBottom: 4,
  },
  readMessage: {
    color: '#999',
  },
  time: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.black,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.padding,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.black,
    marginTop: SIZES.padding,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.black,
    marginTop: SIZES.padding,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  retryButtonText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  unreadBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    alignSelf: 'flex-start',
  },
  unreadText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.padding * 4,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.base,
    opacity: 0.8,
    paddingHorizontal: SIZES.padding * 2,
  },
});

export default Notifications; 