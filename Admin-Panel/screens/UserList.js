import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS, SIZES, FONTS } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';
import IpAddress from '../DeviceConfig';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${IpAddress}:9000/api/users`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUsers(data.users || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity style={styles.userCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
        style={styles.cardGradient}
      >
        <View style={styles.userContent}>
          <View style={styles.avatarContainer}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.userAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={30} color={COLORS.white} />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {`${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown User"}
            </Text>
            <Text style={styles.userEmail}>
              {item.email || "No email"}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="leaf-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>
                  {item.detectionCount || 0} Detections
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="bag-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>
                  {item.orderCount || 0} Orders
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptySubtitle}>
        {loading ? "Loading users..." : "There are no users in the database"}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="User List"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
          rightIcon="refresh-outline"
          onRightPress={onRefresh}
        />
        
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>
                {users.reduce((sum, user) => sum + (user.detectionCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Detections</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bag" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>
                {users.reduce((sum, user) => sum + (user.orderCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item._id || item.id || Math.random().toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={renderEmptyState}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
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
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: 12,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.h4,
    color: COLORS.black,
    fontWeight: '600',
  },
  userEmail: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...FONTS.body4,
    color: COLORS.gray,
    fontSize: 12,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...FONTS.body3,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default UserList; 