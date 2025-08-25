import GroupChatCard from "@/components/chats/GroupChatCard";
import { Colors } from "@/constants/Colors";
import { fetchGroupChats } from "@/helpers/database/group-chat";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import { Searchbar } from "react-native-paper";

type AllChatsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const GroupScreen = ({ navigation }: AllChatsScreenInterface) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<
    { id: string; groupName: string; roomId: string; groupImage: string }[]
  >([]);

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
      (async () => {
        const groupChats = await fetchGroupChats();
        setGroups(
          groupChats.map((group: any) => ({
            id: group.id,
            groupName: group.groupName,
            roomId: group.roomId,
            groupImage: group.groupImage,
          }))
        );
      })();
    }, [])
  );

  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({
      item,
    }: {
      item: {
        roomId: string;
        groupName: string;
        groupImage: string;
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
      <GroupChatCard
        groupName={item?.groupName}
        message={item?.lastMessage?.message}
        isSender={item?.lastMessage?.isSender}
        isRead={item?.lastMessageStatus === "read"}
        roomId={item?.roomId}
        containsFile={item?.lastMessage?.containsFile}
        groupImage={item?.groupImage}
      />
    ),
    []
  );

  return (
    <>
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
          data={groups}
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

export default GroupScreen;

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

  floatingBtn: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});
