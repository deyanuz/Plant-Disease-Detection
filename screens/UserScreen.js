import { StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Entypo";

const UserScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.viewStyle}>
      <Pressable onPress={() => navigation.toggleDrawer()}>
        <Icon name="menu" size={30} color="#000" style={{ marginLeft: 10 }} />
      </Pressable>
      <Text style={styles.textStyle}>This is User Screen</Text>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  viewStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#DFE8D8",
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
export default UserScreen;
