import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { COLORS } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';

const DiseaseDatabase = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Disease Database"
        leftIcon="menu-outline"
        onLeftPress={() => navigation.openDrawer()}
      />
      <View style={styles.content}>
        <Text style={styles.text}>Disease Database Content Goes Here</Text>
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

export default DiseaseDatabase; 