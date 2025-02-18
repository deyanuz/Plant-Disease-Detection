import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const Notifications = () => {
  // Add notification implementation here
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
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

export default Notifications; 