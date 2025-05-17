import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { store } from "@/lib/redux-store/store";
import HomeScreen from "@/screen/home-screen";
import RegScreen from "@/screen/reg-screen";
import VerificationScreen from "@/screen/verification-screen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar
          style="auto"
          translucent={true}
          backgroundColor={backgroundColor}
        />
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <SafeAreaView
            style={styles.container}
            edges={["top", "bottom", "left", "right"]}
          >
            <Stack.Navigator
            // screenOptions={
            //   {
            //     // headerStyle: { backgroundColor: backgroundColor },
            //     // headerTitleStyle: {
            //     //   fontSize: 30,
            //     //   fontWeight: "bold",
            //     // },
            //   }
            // }
            >
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
            </Stack.Navigator>
          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
