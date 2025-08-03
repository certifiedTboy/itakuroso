import { useColorScheme } from "@/hooks/useColorScheme";
import AiChatContextProvider from "@/lib/context/aichat-context";
import { AuthContext } from "@/lib/context/auth-context";
import ChatContextProvider from "@/lib/context/chat-context";
import ContactScreenDropdownProvider from "@/lib/context/contactscreen-dropdown-context";
import DropdownContextProvider from "@/lib/context/dropdown-context";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect } from "react";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import AuthStack from "./auth-stack";
import AuthenticatedStack from "./authenticated-stack";

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

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" translucent={true} />
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {authCtx.isAuthenticated ? (
          <ChatContextProvider>
            <AiChatContextProvider>
              <ContactScreenDropdownProvider>
                <DropdownContextProvider>
                  <AuthenticatedStack />
                </DropdownContextProvider>
              </ContactScreenDropdownProvider>
            </AiChatContextProvider>
          </ChatContextProvider>
        ) : (
          <AuthStack />
        )}
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default Navigation;
