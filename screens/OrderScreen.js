import { Pressable, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";

const OrderScreen = ({ navigation }) => {
  return (
    <SafeAreaView>
      <Pressable onPress={() => navigation.toggleDrawer()}>
        <Icon name="menu" size={30} color="#000" style={{ marginLeft: 10 }} />
      </Pressable>
      <Text>OrderScreen</Text>
    </SafeAreaView>
  );
};

export default OrderScreen;