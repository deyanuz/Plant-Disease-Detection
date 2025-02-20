import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';
import IpAddress from "../DeviceConfig";
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';

const BASE_URL = `http://${IpAddress}:9000`;

const AddAdmin = ({ navigation }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/admins`);
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      Alert.alert("Error", "Failed to fetch admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/admins`, {
        email: newAdminEmail,
        password,
      });
      Alert.alert("Success", "Admin added successfully!");
      setNewAdminEmail("");
      setPassword("");
      setConfirmPassword("");
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      Alert.alert("Error", "Failed to add admin. Please try again.");
    }
  };

  const handleDeleteAdmin = async (id, isPrimary) => {
    if (isPrimary) {
      Alert.alert("Error", "The primary admin cannot be deleted.");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/admins/${id}`);
      Alert.alert("Success", "Admin deleted successfully!");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      Alert.alert("Error", "Failed to delete admin. Please try again.");
    }
  };

  const renderAdminItem = ({ item }) => (
    <Card style={styles.adminCard}>
      <View style={styles.adminContent}>
        <View style={styles.adminInfo}>
          <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.adminEmail}>{item.email}</Text>
        </View>
        {item.isPrimary ? (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryLabel}>Primary Admin</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteAdmin(item._id, item.isPrimary)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Admin Management"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />
        
        <View style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Admin</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter admin email"
              placeholderTextColor={COLORS.textLight}
              value={newAdminEmail}
              onChangeText={setNewAdminEmail}
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              >
                <Ionicons
                  name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAdmin}>
              <Text style={styles.addButtonText}>Add Admin</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Admin List</Text>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : (
              <FlatList
                data={admins}
                renderItem={renderAdminItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={50} color={COLORS.textLight} />
                    <Text style={styles.emptyMessage}>No admins available</Text>
                  </View>
                }
              />
            )}
          </View>
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
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  formTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius / 2,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  passwordInput: {
    flex: 1,
    padding: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SIZES.padding,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addButtonText: {
    ...FONTS.bold,
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginBottom: SIZES.padding,
  },
  adminCard: {
    marginBottom: SIZES.padding,
  },
  adminContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminEmail: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: "#000",
    marginLeft: SIZES.padding,
  },
  primaryBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  primaryLabel: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  deleteButton: {
    padding: SIZES.base,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  emptyMessage: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginTop: SIZES.padding,
  },
});

export default AddAdmin;
