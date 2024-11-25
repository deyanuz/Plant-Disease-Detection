import {StyleSheet, Text, View} from 'react-native';

function HistoryScreen() {
  return (
    <View style={styles.viewStyle}>
      
      <Text style={styles.textStyle}>This is History Screen</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  viewStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  textStyle: {
    fontSize: 28,
    color: 'black',
  },
  headingStyle: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
  },
});
export default HistoryScreen;