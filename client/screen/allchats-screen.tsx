import ChatCard from "@/components/chats/ChatCard";
import MenuDropdown from "@/components/dropdown/MenuDropdown";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { formatPhoneNumber } from "@/helpers/contact-helpers";
import { getContacts } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetCurrentUserMutation } from "@/lib/apis/userApis";
import { DropdownContext } from "@/lib/context/dropdown-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { Searchbar } from "react-native-paper";

type AllChatsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const AllChatsScreen = ({ navigation }: AllChatsScreenInterface) => {
  const [searchQuery, setSearchQuery] = useState("");
  // const [rooms, getExistingRoomsData] = useGetActiveRooms();
  const [savedContacts, setSavedContacts] = useState<
    { id: string; phoneNumber: string; name: string; roomId?: string }[]
  >([]);

  const [getCurrentUser] = useGetCurrentUserMutation();

  const [rooms, setRooms] = useState<
    {
      roomId: string;
      roomName?: string;
      contactName?: string;
      contactPhoneNumber?: string;
      roomImage: string;
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

  /**
   * useNavigation hook to navigate between screens
   * This is used to navigate to the contact list screen when the floating button is pressed
   */
  const navigate = useNavigation();

  const { currentUser } = useSelector((state: any) => state.authState);

  const { toggleDropdown } = useContext(DropdownContext);

  /**
   * useColorScheme hook to get the current color scheme of the device
   * This is used to set the background color of the search bar
   */
  const theme = useColorScheme();

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "background"
  );

  useFocusEffect(
    useCallback(() => {
      getCurrentUser(null);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        // getExisitngRooms(null);

        const contacts = await getContacts();

        if (contacts && contacts.length > 0) {
          setSavedContacts(
            contacts.filter(
              (contact: any) =>
                contact?.roomId !== null &&
                formatPhoneNumber(contact?.phoneNumber) !==
                  formatPhoneNumber(currentUser?.phoneNumber)
            )
          );
        }
      })();
    }, [currentUser])
  );

  useEffect(() => {
    if (savedContacts && savedContacts.length > 0) {
      // console.log("data fetched", data?.data);
      setRooms(
        savedContacts.map((contact: any) => {
          return {
            ...contact,
            roomId: contact.roomId,
            contactPhoneNumber: contact.phoneNumber,
            contactName: contact.name,
            roomName: contact?.roomName || "", // this applies for group chats
            roomImage: contact?.roomImage || "",
            lastMessage: {
              messageId: contact?.lastMessageId || "",
              isSender: contact?.lastMessageSenderId !== contact?.phoneNumber,
              message: contact?.lastMessageContent || "",
              timestamp: contact?.lastMessageTimestamp || "",
              isRead: contact?.lastMessageIsRead || false,
              containsFile: !!contact?.lastMessageFile,
              senderId: contact?.lastMessageSenderId || "",
            },
          };
        })
      );
    }
  }, [savedContacts]);

  /**
   * Options for the dropdown menu
   * These options will be displayed when the user clicks on the menu icon
   */
  const options = [
    {
      label: "Settings",
      onPress: () => {
        // @ts-ignore
        navigate.navigate("user-profile-screen");
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
        contactName: string;
        roomImage: string;
        phoneNumber: string;
        name: string;
        lastMessageStatus: string;
        members: { name: string; profileImage?: string; phoneNumber: string }[];
        lastMessage: {
          isSender: boolean;
          message: string;
          timestamp: string;
          lastMessageStatus: string;
          containsFile?: boolean;
          senderId: string;
        };
      };
    }) => (
      <ChatCard
        contactName={item?.contactName}
        phoneNumber={item?.phoneNumber}
        message={item?.lastMessage?.message}
        time={item?.lastMessage?.timestamp}
        isSender={item?.lastMessage?.isSender}
        isRead={item?.lastMessageStatus === "read"}
        image=""
        roomId={item?.roomId}
        containsFile={item?.lastMessage?.containsFile}
        senderId={item?.lastMessage?.senderId}
      />
    ),
    []
  );

  // console.log("rooms", rooms);

  return (
    <>
      <Pressable
        // @ts-ignore
        onPress={() => navigate.push("ai-screen")}
        style={styles.aiIconContainer}
      >
        <Image
          style={styles.aiIcon}
          source={require("@/assets/images/ai.gif")}
        />
      </Pressable>

      <FloatingBtn
        // @ts-ignore
        onNavigate={() => navigate.navigate("contact-lists-screen")}
        iconName="account-multiple-plus-outline"
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          zIndex: 100,
        }}
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

        <FlatList
          // @ts-ignore
          data={rooms}
          renderItem={RenderedCard}
          keyExtractor={(item) => item.roomId}
          numColumns={1}
          scrollEventThrottle={16} // Improves performance
          // onEndReached={handleEndReached} // Trigger when reaching the end
          onEndReachedThreshold={0.5} // Adjust sensitivity
        />
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

  aiIconContainer: {
    flex: 1,
    position: "absolute",
    // margin: 16,
    marginRight: 20,
    marginBottom: 10,
    right: 0,
    bottom: 70,
    zIndex: 100,
  },

  aiIcon: {
    width: 50,
    height: 50,
  },
});
