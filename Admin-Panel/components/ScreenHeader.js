import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS, SIZES, FONTS } from '../styles/theme';

const ScreenHeader = ({ title, leftIcon, rightIcon, onLeftPress, onRightPress }) => {
  return (
    <View style={styles.header}>
      {leftIcon && (
        <TouchableOpacity style={styles.iconButton} onPress={onLeftPress}>
          <Ionicons name={leftIcon} size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {rightIcon && (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: 'transparent',
    marginBottom: -SIZES.padding,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: SIZES.base,
    width: 44,
  },
});

export default ScreenHeader; 