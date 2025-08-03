import SearchInput from "@/components/contacts/SearchInput";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ContactScreenDropdownContext } from "@/lib/context/contactscreen-dropdown-context";
import AIScreen from "@/screen/ai-screen";
import ChatScreen from "@/screen/chat-screen";
import ContactListsScreen from "@/screen/contact-lists-screen";
import UserProfileScreen from "@/screen/user-profile-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import MainTabs from "./tab/main-tabs";

const Stack = createNativeStackNavigator();

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

  const titleColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.text },
    "text"
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
          detatchInactiveScreens: false,
          detachPreviousScreen: false,
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
                    color: titleColor,
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
          unMountOnBlur: false,
        })}
      />
      <Stack.Screen
        name="chat-screen"
        // @ts-ignore
        component={ChatScreen}
        options={({
          route,
        }: {
          route: {
            params?: {
              contactName?: string;
              phoneNumber?: string;
              isOnline?: boolean;
              lastSeen?: string | number | Date;
            };
          };
        }) => ({
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
                    color: titleColor,
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route && route.params && route.params.contactName
                    ? route.params.contactName[0].toUpperCase() +
                      route.params.contactName.slice(1)
                    : route && route.params && route.params.phoneNumber
                    ? route.params.phoneNumber
                    : "Chat"}
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
                    {formatDate(
                      route.params?.lastSeen
                        ? String(route.params.lastSeen)
                        : ""
                    )}
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

export default AuthenticatedStack;
