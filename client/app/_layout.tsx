import SearchInput from "@/components/contacts/SearchInput";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import AuthContextProvider, { AuthContext } from "@/lib/context/auth-context";
import ChatContextProvider from "@/lib/context/chat-context";
import ContactScreenDropdownProvider, {
  ContactScreenDropdownContext,
} from "@/lib/context/contactscreen-dropdown-context";
import DropdownContextProvider from "@/lib/context/dropdown-context";
import { store } from "@/lib/redux-store/store";
import AIScreen from "@/screen/ai-screen";
import ChatScreen from "@/screen/chat-screen";
import ContactListsScreen from "@/screen/contact-lists-screen";
import HomeScreen from "@/screen/home-screen";
import PasscodeScreen from "@/screen/passcode-screen";
import RegScreen from "@/screen/reg-screen";
import UserProfileScreen from "@/screen/user-profile-screen";
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
import { StyleSheet, Text, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
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
  const {
    toggleDropdown,
    toggleSearchBar,
    showSearchBar,
    totalContacts,
    onSearchQuery,
    contactSearchQuery,
    contactIsLoading,
  } = useContext(ContactScreenDropdownContext);

  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const chatScreenTitleColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "text"
  );

  const headerTextColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor } }}>
      <Stack.Screen
        name="main-tabs"
        options={() => ({
          headerShown: false,
        })}
        component={MainTabs}
      />

      <Stack.Screen
        name="ai-screen"
        component={AIScreen}
        options={() => ({
          headerShown: true,
          headerTitle: () => {
            return (
              <View
                style={{
                  marginLeft: -20,
                  backgroundColor: backgroundColor,
                  height: 50,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: chatScreenTitleColor,
                    fontWeight: "500",
                    fontSize: 24,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Itakurọsọ AI
                </Text>
              </View>
            );
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "bold",
            color: chatScreenTitleColor,
          },
          headerStyle: {
            backgroundColor,
          },
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="chat-screen"
        // @ts-ignore
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,

          headerTitle: () => {
            return (
              <View
                style={{
                  marginLeft: -20,
                  backgroundColor: backgroundColor,
                }}
              >
                <Text
                  style={{
                    color: chatScreenTitleColor,
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.params!.contactName[0].toUpperCase() +
                    route.params!.contactName.slice(1) ??
                    route.params!.phoneNumber ??
                    "Chat"}
                </Text>

                {!route?.params?.isOnline ? (
                  <Text
                    style={{
                      color: chatScreenTitleColor,
                      fontWeight: "500",
                      fontSize: 13,
                      marginTop: 4,
                      opacity: 0.8,
                    }}
                  >
                    Last Seen
                    {route.params?.lastSeen &&
                      ` ${new Date(route.params.lastSeen).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}`}
                    {" - "}
                    {formatDate(route.params?.lastSeen)}
                  </Text>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      // marginLeft: 20,
                      alignItems: "center",
                      gap: 5,
                      marginTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: chatScreenTitleColor,
                        fontWeight: "500",
                        fontSize: 12,
                        opacity: 0.8,
                        marginBottom: 3,
                      }}
                    >
                      Online
                    </Text>
                    <Icon name="ellipse" color={Colors.dark.btnBgc} size={12} />
                  </View>
                )}
              </View>
            );
          },
          animation: "slide_from_right",
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
        })}
      />

      <Stack.Screen
        name="contact-lists-screen"
        component={ContactListsScreen}
        options={({ route }) => ({
          animation: "slide_from_right",
          // headerShown: true,
          headerTitle: () => (
            <>
              {!showSearchBar ? (
                <View
                  style={{
                    marginLeft: -20,
                    // marginRight: 15,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: headerTextColor,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      Select Contacts
                    </Text>
                    <Text style={{ color: headerTextColor, fontSize: 12 }}>
                      {totalContacts}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 20 }}>
                    {contactIsLoading && <LoaderSpinner />}
                    <Icon
                      name="search"
                      size={21}
                      color={headerTextColor}
                      onPress={() => toggleSearchBar()}
                    />

                    <Icon
                      name="ellipsis-vertical"
                      size={21}
                      color={headerTextColor}
                      onPress={() => toggleDropdown()}
                    />
                  </View>
                </View>
              ) : (
                <SearchInput
                  setShowSearch={() => toggleSearchBar()}
                  showSearchInput={showSearchBar}
                  onSearchQuery={(text) => onSearchQuery(text)}
                  searchQuery={contactSearchQuery}
                />
              )}
            </>
          ),
          headerTitleStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },

          headerBackVisible: !showSearchBar,
        })}
      />

      <Stack.Screen
        name="user-profile-screen"
        component={UserProfileScreen}
        options={{
          headerTitle: "Profile",
          animation: "slide_from_right",
          headerStyle: {
            backgroundColor,
          },
        }}
      />
    </Stack.Navigator>
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" translucent={true} />
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {authCtx.isAuthenticated ? (
          <ChatContextProvider>
            <ContactScreenDropdownProvider>
              <DropdownContextProvider>
                <AuthenticatedStack />
              </DropdownContextProvider>
            </ContactScreenDropdownProvider>
          </ChatContextProvider>
        ) : (
          <AuthStack />
        )}
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default function RootLayout() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
