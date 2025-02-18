import React from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS } from '../styles/theme';
import ScreenHeader from "../components/ScreenHeader";

const TransactionManagement = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Transactions"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />
        <View style={styles.content}>
          <Text style={styles.text}>Transaction Management</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.white,
  }
});

export default TransactionManagement; 