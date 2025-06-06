import ChatCard from "@/components/chats/ChatCard";
import MenuDropdown from "@/components/dropdown/MenuDropdown";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { formatPhoneNumber } from "@/helpers/contact-helpers";
import { createChatTable, getLastChatByRoomId } from "@/helpers/database/chats";
import { getContacts } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetExisitngRoomsMutation } from "@/lib/apis/chat-apis";
import { AuthContext } from "@/lib/context/auth-context";
import { DropdownContext } from "@/lib/context/dropdown-context";
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
      lastMessage?: { isSender: boolean; message: string; timestamp: string };
    }[]
  >([]);
  const [getExisitngRooms, { data, error, isSuccess }] =
    useGetExisitngRoomsMutation();

  const { currentUser } = useSelector((state: any) => state.authState);

  const navigate = useNavigation();

  const theme = useColorScheme();

  const { toggleDropdown } = useContext(DropdownContext);

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const onLoadChatInfo = async () => {
      getExisitngRooms(null);
    };

    onLoadChatInfo();
  }, []);

  useEffect(() => {
    const onLoadContacts = async () => {
      const contacts = await getContacts();

      await createChatTable();

      if (data?.data && contacts && contacts.length > 0) {
        // console.log(data?.data[0]?.members);
        // console.log(contacts[50]);
        data.data.forEach(async (room: any) => {
          const lastChat = await getLastChatByRoomId(room.roomId);

          // console.log(lastChat);

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
                // @ts-ignore
                isSender: lastChat![0]?.senderId !== currentUser.phoneNumber,
                // @ts-ignore
                message: lastChat![0]?.message,
                // @ts-ignore
                timestamp: lastChat![0]?.timestamp,
              },
            },
          ]);
        });
      }
    };

    onLoadContacts();
  }, [data, isSuccess]);

  // useEffect(() => {
  //   if (rooms && rooms.length > 0) {
  //     const onLoadChatInfo = async () => {
  //       for (let room of rooms) {
  //         const chats = await getChatsByRoomId(room.roomId);
  //         console.log(chats);
  //       }
  //     };

  //     onLoadChatInfo();
  //   }
  // }, [rooms]);

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "background"
  );

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

  // console.log(rooms[0]?.members);
  // console.log(
  //   rooms[0]?.members.find(
  //     (member: any) => member.phoneNumber !== currentUser?.phoneNumber
  //   )
  // );

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
        lastMessage?: { isSender: boolean; message: string; timestamp: string };
      };
    }) => (
      <ChatCard
        sender={
          (item.members &&
            item.members.find(
              (member: any) => member.phoneNumber !== currentUser?.phoneNumber
            )?.name!) ||
          item.members.find(
            (member: any) => member.phoneNumber !== currentUser?.phoneNumber
          )?.phoneNumber!
        }
        contactName={
          item.members &&
          item.members.find(
            (member: any) => member.phoneNumber !== currentUser?.phoneNumber
          )?.name!
        }
        phoneNumber={
          item.members.find(
            (member: any) => member.phoneNumber !== currentUser?.phoneNumber
          )?.phoneNumber!
        }
        message={item.lastMessage?.message || ""}
        // time={item.time}
        image={require("../assets/images/avatar.png")}
        roomId={item.roomId}
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
            data={rooms && rooms.length > 0 && rooms}
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
