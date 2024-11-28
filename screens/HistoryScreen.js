import { useEffect } from "react";
import { StyleSheet, Text, View, Button, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "react-native-vector-icons/Entypo";

const HistoryScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.viewStyle}>
      
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  viewStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  textStyle: {
    fontSize: 28,
    color: "black",
  },
  headingStyle: {
    fontSize: 30,
    color: "black",
    textAlign: "center",
  },
});
export default HistoryScreen;
