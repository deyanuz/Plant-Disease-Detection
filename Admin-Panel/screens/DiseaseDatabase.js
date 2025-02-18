import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DiseaseDatabase = () => {
  // Add disease database implementation here
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Disease Database</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default DiseaseDatabase; 