import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import AuthContextProvider, { AuthContext } from "@/lib/context/auth-context";
import ChatContextProvider from "@/lib/context/chat-context";
import DropdownContextProvider from "@/lib/context/dropdown-context";
import { store } from "@/lib/redux-store/store";
import ChatScreen from "@/screen/chat-screen";
import ContactListsScreen from "@/screen/contact-lists-screen";
import HomeScreen from "@/screen/home-screen";
import PasscodeScreen from "@/screen/passcode-screen";
import RegScreen from "@/screen/reg-screen";
import VerificationScreen from "@/screen/verification-screen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import MainTabs from "./tab/main-tabs";

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

/**
 * AuthenticatedStack is the stack navigator for the authenticated flow
 * It contains the main tabs screen
 * user need to be authentacated to access this stack and its screens
 * it is the main stack tab navigator for the app which contains screens such as chat, status AI and calls screens
 */
const AuthenticatedStack = () => {
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  return (
    <ChatContextProvider>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor } }}>
        <Stack.Screen
          name="main-tabs"
          options={() => ({
            headerShown: false,
          })}
          component={MainTabs}
        />

        <Stack.Screen
          name="chat-screen"
          options={{
            animation: "slide_from_right",
          }}
          // options={{ headerShown: false }}
          component={ChatScreen}
        />

        <Stack.Screen
          name="contact-lists-screen"
          component={ContactListsScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </ChatContextProvider>
  );
};

/**
 * Navigation is the main navigation component for the app
 * It contains the auth stack and authenticated stack
 * It also handles the theme and status bar
 */
const Navigation = () => {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    authCtx.checkUserIsAuthenticated();
  }, []);

  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <DropdownContextProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" translucent={true} />
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          {authCtx.isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
        </SafeAreaProvider>
      </ThemeProvider>
    </DropdownContextProvider>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthContextProvider>
        <Navigation />
      </AuthContextProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
