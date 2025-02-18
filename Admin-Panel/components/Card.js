import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../styles/theme';

const Card = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOWS.medium,
  },
});

export default Card; 