import AuthContextProvider from "@/lib/context/auth-context";
import { store } from "@/lib/redux-store/store";
import { useFonts } from "expo-font";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import { Provider } from "react-redux";
import Navigation from "./navigation";

export default function RootLayout() {
  const [loaded] = useFonts({
    roboto: require("@/assets/fonts/Roboto-Regular.ttf"),
    robotoMedium: require("@/assets/fonts/Roboto-Medium.ttf"),
    robotoBold: require("@/assets/fonts/Roboto-Bold.ttf"),
    robotoLight: require("@/assets/fonts/Roboto-Light.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <KeyboardProvider>
        <AuthContextProvider>
          <Navigation />
        </AuthContextProvider>
      </KeyboardProvider>
    </Provider>
  );
}
