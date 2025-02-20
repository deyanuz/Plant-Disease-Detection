import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Image, Animated } from "react-native";
import icon from "../assets/icons/icon.jpg";

export default function SplashScreen() {
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnimation]);
  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.imageContainer, { opacity: fadeAnimation }]}
      >
        <Image style={styles.image} source={icon} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
  imageContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "cover",
  },
});
