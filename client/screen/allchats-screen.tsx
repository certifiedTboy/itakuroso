import ChatCard from "@/components/chats/ChatCard";
import MenuDropdown from "@/components/dropdown/MenuDropdown";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { formatPhoneNumber } from "@/helpers/contact-helpers";
import { getContacts } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetExisitngRoomsMutation } from "@/lib/apis/chat-apis";
import { AuthContext } from "@/lib/context/auth-context";
import { ChatContext } from "@/lib/context/chat-context";
import { DropdownContext } from "@/lib/context/dropdown-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { useSelector } from "react-redux";

type AllChatsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const AllChatsScreen = ({ navigation }: AllChatsScreenInterface) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<
    {
      roomId: string;
      roomName: string;
      roomImage: string;
      members: { name: string; profileImage?: string; phoneNumber: string }[];
      lastMessage: {
        isSender: boolean;
        message: string;
        timestamp: string;
        isRead: boolean;
        containsFile?: boolean;
        senderId: string;
      };
    }[]
  >([]);
  const [getExisitngRooms, { data, error, isSuccess }] =
    useGetExisitngRoomsMutation();

  /**
   * useSelector hook to get the current user from the Redux store
   * This is used to identify the current user in the chat room
   */
  const { currentUser } = useSelector((state: any) => state.authState);

  /**
   * useNavigation hook to navigate between screens
   * This is used to navigate to the contact list screen when the floating button is pressed
   */
  const navigate = useNavigation();

  /**
   * useColorScheme hook to get the current color scheme of the device
   * This is used to set the background color of the search bar
   */
  const theme = useColorScheme();

  const { toggleDropdown } = useContext(DropdownContext);
  const authCtx = useContext(AuthContext);
  const chatCtx = useContext(ChatContext);

  /**
   * useFocusEffect hook to perform actions when the screen is focused
   * This is used to fetch existing chat rooms when the screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      const onLoadChatInfo = async () => {
        getExisitngRooms(null);
      };

      onLoadChatInfo();
    }, [chatCtx.triggerCount])
  );

  /**
   * useEffect hook to fetch contacts and update the chat rooms
   * This is used to get the contact names and images for each chat room
   */
  useFocusEffect(
    useCallback(() => {
      const onLoadContacts = async () => {
        const contacts = await getContacts();

        // await createChatTable();

        if (data?.data && contacts && contacts.length > 0) {
          setRooms([
            ...data?.data.map((room: any) => {
              return {
                roomId: room.roomId,
                roomName: room.roomName,
                roomImage: room.roomImage,
                members: room.members.map((member: any) => {
                  const contact = contacts.find(
                    (contact: any) =>
                      formatPhoneNumber(contact.phoneNumber) ===
                      formatPhoneNumber(member.phoneNumber)
                  );

                  return {
                    // @ts-ignore
                    name: contact && contact.name,
                    profileImage: member.profileImage,
                    phoneNumber: member.phoneNumber,
                  };
                }),

                lastMessage: {
                  isSender:
                    room?.lastMessage?.senderId === currentUser.phoneNumber,
                  message: room?.lastMessage?.content,
                  timestamp: room?.lastMessage?.timestamp,
                  isRead: room?.lastMessage?.isRead,
                  containsFile: room?.lastMessage?.containsFile,
                  senderId: room?.lastMessage?.senderId,
                },
              };
            }),
          ]);
        }
      };

      onLoadContacts();
    }, [isSuccess, data, error])
  );

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "background"
  );

  /**
   * Options for the dropdown menu
   * These options will be displayed when the user clicks on the menu icon
   */
  const options = [
    {
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      label: "Help",
      onPress: () => navigation.navigate("Help"),
    },
    {
      label: "Logout",
      onPress: () => {
        authCtx.logout();
        toggleDropdown();
      },
    },
  ];

  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({
      item,
    }: {
      item: {
        roomId: string;
        roomName: string;
        roomImage: string;
        members: { name: string; profileImage?: string; phoneNumber: string }[];
        lastMessage: {
          isSender: boolean;
          message: string;
          timestamp: string;
          isRead: boolean;
          containsFile?: boolean;
          senderId: string;
        };
      };
    }) => (
      <ChatCard
        members={item.members}
        message={item.lastMessage?.message}
        time={item.lastMessage?.timestamp}
        isSender={item.lastMessage?.isSender}
        image=""
        roomId={item.roomId}
        isRead={item.lastMessage?.isRead}
        containsFile={item.lastMessage?.containsFile}
        senderId={item.lastMessage?.senderId}
      />
    ),
    []
  );

  return (
    <>
      <FloatingBtn
        // @ts-ignore
        onNavigate={() => navigate.navigate("contact-lists-screen")}
      />
      <MenuDropdown options={options} />
      <View style={styles.contianer}>
        <Searchbar
          iconColor={textColor}
          inputStyle={{
            color: textColor,
            marginTop: -8,
          }}
          placeholder="Search"
          placeholderTextColor={textColor}
          onChangeText={setSearchQuery}
          onClearIconPress={() => console.log("Clear icon pressed")}
          value={searchQuery}
          style={[
            {
              backgroundColor: theme === "dark" ? "#333" : "#E8E8E8FF",
              margin: 10,
            },
            styles.searchInput,
          ]}
        />

        <View>
          <FlatList
            data={rooms}
            renderItem={RenderedCard}
            keyExtractor={(item) => item.roomId}
            numColumns={1}
            scrollEventThrottle={16} // Improves performance
            // onEndReached={handleEndReached} // Trigger when reaching the end
            onEndReachedThreshold={0.5} // Adjust sensitivity
          />
        </View>
      </View>
    </>
  );
};

export default AllChatsScreen;

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },

  searchInput: {
    height: 40,
  },
});
