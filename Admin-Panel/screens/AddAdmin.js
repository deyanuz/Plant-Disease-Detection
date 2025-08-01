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
      const response = await axios.post(`${BASE_URL}/admins`, {
        email: newAdminEmail.trim(),
        password,
      });
      Alert.alert("Success", "Admin added successfully!");
      setNewAdminEmail("");
      setPassword("");
      setConfirmPassword("");
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      const errorMessage = error.response?.data?.error || "Failed to add admin. Please try again.";
      Alert.alert("Error", errorMessage);
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
            <View style={styles.formHeader}>
              <Ionicons name="people-circle-outline" size={40} color={COLORS.primary} />
              <Text style={styles.formTitle}>Add New Admin</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter admin email"
                  placeholderTextColor={COLORS.textLight}
                  value={newAdminEmail}
                  onChangeText={setNewAdminEmail}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
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
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
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
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddAdmin}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Admin</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Ionicons name="people-outline" size={24} color={COLORS.white} />
              <Text style={styles.listTitle}>Admin List</Text>
            </View>
            
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
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
  },
  formTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginLeft: SIZES.padding,
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  inputIcon: {
    marginRight: SIZES.base,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  eyeIcon: {
    padding: SIZES.base,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding,
    ...SHADOWS.medium,
  },
  addButtonText: {
    ...FONTS.bold,
    color: COLORS.white,
    fontSize: SIZES.font,
    marginLeft: SIZES.base,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  listTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginLeft: SIZES.base,
  },
  adminCard: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  adminContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    
  },
  adminEmail: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.black,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  emptyMessage: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginTop: SIZES.padding,
  },
});

export default AddAdmin;
