import ContactLastSeen from "@/components/chats/ContactLastSeen";
import SearchInput from "@/components/contacts/SearchInput";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ContactScreenDropdownContext } from "@/lib/context/contactscreen-dropdown-context";
import AIScreen from "@/screen/ai-screen";
import ChatScreen from "@/screen/chat-screen";
import ContactListsScreen from "@/screen/contact-lists-screen";
import UserProfileScreen from "@/screen/user-profile-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Text, View } from "react-native";
import { Avatar } from "react-native-paper";
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
              profileImage?: string;
            };
          };
        }) => ({
          headerShown: true,

          headerTitle: () => {
            return (
              <View
                style={{
                  marginLeft: -25,
                  // marginTop: -25,
                  backgroundColor: backgroundColor,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <View>
                  {route?.params?.profileImage ? (
                    <Avatar.Image
                      size={40}
                      source={{ uri: route.params.profileImage }}
                    />
                  ) : (
                    <Avatar.Text
                      size={40}
                      label={
                        route.params!.contactName! &&
                        route.params!.contactName![0].charAt(0).toUpperCase()
                      }
                      style={{ backgroundColor: Colors.light.btnBgc }}
                    />
                  )}
                </View>
                <View>
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

                  <ContactLastSeen
                    isOnline={route.params?.isOnline}
                    lastSeenTime={route.params?.lastSeen?.toLocaleString()}
                  />
                </View>
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
