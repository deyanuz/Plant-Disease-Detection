import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../styles/theme';
import ScreenHeader from '../components/ScreenHeader';

const DiseaseDatabase = ({ navigation }) => {
  // Add disease database implementation here
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="Disease Database"
          leftIcon="menu-outline"
          onLeftPress={() => navigation.openDrawer()}
        />
        {/* Rest of your existing DiseaseDatabase content */}
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
});

export default DiseaseDatabase; 