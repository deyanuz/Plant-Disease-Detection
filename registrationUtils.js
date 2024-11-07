import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveRegProgress = async (screenName, data) => {
  try {
    const key = `registration_progress_${screenName}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(`saved progress for ${screenName}`);
  } catch (error) {
    console.error("error", error);
  }
};

export const getRegProgress = async (screenName) => {
  try {
    const key = `registration_progress_${screenName}`;
    const data = await AsyncStorage.getItem(key);
    return data !== null ? JSON.parse(data) : null;
  } catch (error) {
    console.error("error", error);
  }
};
