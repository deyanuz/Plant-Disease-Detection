import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { COLORS } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';

const UserHistory = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="User History"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
      />
      <View style={styles.content}>
        <Text style={styles.text}>User History Content Goes Here</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserHistory;
