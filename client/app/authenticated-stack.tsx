import ContactLastSeen from "@/components/chats/ContactLastSeen";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ContactScreenDropdownContext } from "@/lib/context/contactscreen-dropdown-context";
import AIScreen from "@/screen/ai-screen";
import ChatScreen from "@/screen/chat-screen";
import ContactListsScreen from "@/screen/contact-lists-screen";
import GroupChatScreen from "@/screen/group-chat-screen";
import NewGroupDetailsScreen from "@/screen/new-group-details-screen";
import NewGroupScreen from "@/screen/new-group-screen";
import UserProfileScreen from "@/screen/user-profile-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext, useState } from "react";
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
  const { totalContacts, onSearchQuery } = useContext(
    ContactScreenDropdownContext
  );

  const [searchBarIsFocused, setSearchBarIsFocused] = useState(false);
  const [contactScreenSearchBarIsFocused, setContactScreenSearchBarIsFocused] =
    useState(false);

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
        // @ts-ignore
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
                  marginLeft: -30,
                  backgroundColor: backgroundColor,
                  gap: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Avatar.Image
                  size={50}
                  style={{ backgroundColor: "transparent" }}
                  source={require("@/assets/images/ai.gif")}
                />
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
          headerBackVisible: !contactScreenSearchBarIsFocused,
          animation: "slide_from_right",

          headerSearchBarOptions: {
            placeholder: "Search contacts...",
            onFocus: () => {
              setContactScreenSearchBarIsFocused(true);
            },
            onBlur: () => {
              setContactScreenSearchBarIsFocused(false);
            },

            onChangeText: (event) => {
              onSearchQuery(event.nativeEvent.text);
            },
          },

          headerTitle: () => (
            <>
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
                      fontFamily: "robotoMedium",
                    }}
                  >
                    Select Contacts
                  </Text>
                  <Text style={{ color: headerTextColor, fontSize: 12 }}>
                    {totalContacts}
                  </Text>
                </View>
              </View>
            </>
          ),
          headerTitleStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
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

      <Stack.Screen
        name="new-group-screen"
        component={NewGroupScreen}
        options={{
          headerTitle: "New Group",
          animation: "slide_from_right",
          headerBackVisible: !searchBarIsFocused,
          headerSearchBarOptions: {
            placeholder: "Search...",

            onFocus: () => {
              setSearchBarIsFocused(true);
            },

            onBlur: () => {
              setSearchBarIsFocused(false);
            },
          },
        }}
      />

      <Stack.Screen
        name="new-group-details-screen"
        // @ts-ignore
        component={NewGroupDetailsScreen}
        options={{
          headerTitle: "New Group",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="group-chat-screen"
        component={GroupChatScreen}
        options={{
          headerTitle: "Group Chat",
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStack;
