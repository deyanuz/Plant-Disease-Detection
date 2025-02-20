import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { COLORS, SIZES } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';

const UserHistory = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="User History"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />
        <Text style={styles.text}>Manage Products Screen</Text>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserHistory;
