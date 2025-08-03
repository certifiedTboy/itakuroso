import { useThemeColor } from "@/hooks/useThemeColor";
import HomeScreen from "@/screen/home-screen";
import PasscodeScreen from "@/screen/passcode-screen";
import RegScreen from "@/screen/reg-screen";
import VerificationScreen from "@/screen/verification-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

/**
 * Authstack is the stack navigator for the authentication flow
 * It contains the home screen, registration screen, verification screen and passcode screen
 * user do not need to be authentacated to access this stack and its screens
 */
const AuthStack = () => {
  /**
   * request permission to access users contacts
   */
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        await Contacts.requestPermissionsAsync();
      }
    })();
  }, []);

  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  return (
    <SafeAreaView
      style={[{ backgroundColor: backgroundColor }, styles.container]}
      edges={["top", "bottom", "left", "right"]}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="home-screen"
          options={{
            // title: "Itakurọsọ",
            headerShown: false,
          }}
          component={HomeScreen}
        />
        <Stack.Screen
          name="reg-screen"
          options={{ headerShown: false }}
          component={RegScreen}
        />

        <Stack.Screen
          name="verification-screen"
          options={{ headerShown: false }}
          component={VerificationScreen}
        />

        <Stack.Screen
          name="passcode-screen"
          options={{ headerShown: false }}
          component={PasscodeScreen}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AuthStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
