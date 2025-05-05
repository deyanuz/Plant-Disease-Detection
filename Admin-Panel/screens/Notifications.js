import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
        return COLORS.success;
      case 'product':
        return COLORS.info;
      default:
        return COLORS.primary;
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
              name={
                item.type === 'order' 
                  ? 'cart-outline' 
                  : item.type === 'product' 
                    ? 'cube-outline' 
                    : 'notifications-outline'
              } 
              size={24} 
              color={COLORS.white} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Notifications"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
      />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.white} />
          </View>
        ) : (
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
                  color={COLORS.textLight} 
                />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
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
    backgroundColor: COLORS.background,
    opacity: 0.9,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  message: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  time: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.padding * 4,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});

export default Notifications; 