import AsyncStorage from "@react-native-async-storage/async-storage";

export const isAuthenticated = async () => {
  const authToken = await AsyncStorage.getItem("authToken");
  return authToken;
};
