import ChatCard from "@/components/chats/ChatCard";
import MenuDropdown from "@/components/dropdown/MenuDropdown";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { formatPhoneNumber } from "@/helpers/contact-helpers";
// import { createChatTable, getLastChatByRoomId } from "@/helpers/database/chats";
import { getContacts } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetExisitngRoomsMutation } from "@/lib/apis/chat-apis";
import { AuthContext } from "@/lib/context/auth-context";
import { DropdownContext } from "@/lib/context/dropdown-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
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
      lastMessage?: {
        isSender: boolean;
        message: string;
        timestamp: string;
        isRead?: boolean;
        containsFile?: boolean;
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

      // Optional cleanup
      return () => {
        console.log("Screen is unfocused");
      };
    }, [])
  );

  /**
   * useEffect hook to fetch contacts and update the chat rooms
   * This is used to get the contact names and images for each chat room
   */
  useEffect(() => {
    const onLoadContacts = async () => {
      const contacts = await getContacts();

      // await createChatTable();

      if (data?.data && contacts && contacts.length > 0) {
        data.data.map(async (room: any) => {
          setRooms([
            {
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
                  room?.lastMessage?.senderId !== currentUser.phoneNumber,
                message: room?.lastMessage?.content,
                timestamp: room?.lastMessage?.timestamp,
                isRead: room?.lastMessage?.isRead,
                containsFile: room?.lastMessage?.containsFile,
              },
            },
          ]);
        });
      }
    };

    onLoadContacts();
  }, [data, isSuccess]);

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

  // console.log("Rooms: ", rooms[0]?.lastMessage);

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
        lastMessage?: {
          isSender: boolean;
          message: string;
          timestamp: string;
          isRead: boolean;
          containsFile?: boolean;
        };
      };
    }) => (
      <ChatCard
        members={item.members}
        message={item.lastMessage?.message}
        time={item.lastMessage?.timestamp}
        // isSender={item.lastMessage?.isSender}
        image={require("../assets/images/avatar.png")}
        roomId={item.roomId}
        isRead={item.lastMessage?.isRead}
        containsFile={item.lastMessage?.containsFile}
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
          }}
          placeholder="Search"
          placeholderTextColor={textColor}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#E8E8E8FF",
            margin: 10,
          }}
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
});
