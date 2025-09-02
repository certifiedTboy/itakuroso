import TypingIndicator from "@/components/ai/TypingIndicator";
import GroupMessageInput from "@/components/chats/GroupMessageInput";
import MessageBubble from "@/components/chats/MessageBubble";
import { ThemedView } from "@/components/ThemedView";
import { getLocalChatsByRoomId } from "@/helpers/database/chats";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      groupName: string;
      roomId: string;
      senderId: string;
      isRead: boolean;
    };
  };
};

const GroupChatScreen = ({ route }: ChatScreenProps) => {
  const [messageToRespondTo, setMessageToRespondTo] = useState<{
    message: string;
    _id: string;
  } | null>(null);

  const { currentUser } = useSelector((state: any) => state.authState);

  const chatCtx = useContext(ChatContext);
  const { roomId } = route.params;

  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  /**
   * useFocusEffect hook to join the chat room when the screen is focused
   * This ensures that the user is connected to the chat room when they open the chat screen
   */
  useFocusEffect(
    useCallback(() => {
      if (roomId) {
        chatCtx.joinGroup({
          roomId,
          phoneNumber: currentUser?.phoneNumber,
          email: currentUser?.email,
        });

        chatCtx.markMessagesAsRead(roomId, {
          phoneNumber: currentUser?.phoneNumber,
        });
      }
    }, [])
  );

  // Update context messages when fetched
  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (roomId) {
          const result = (await getLocalChatsByRoomId(roomId)) ?? [];

          if (result && result.length > 0) {
            //@ts-ignore
            chatCtx.updateSocketMessages(result, currentUser);
          }
        }
      })();

      return () => {
        chatCtx.updateSocketMessages([], currentUser);
      };
    }, [])
  );

  // Memoized render function
  const RenderedCard = useCallback(
    ({ item }: { item: any }) => (
      <MessageBubble
        message={{
          ...item,
          isSender: item.senderId === currentUser?.phoneNumber,
          setMessageToRespondTo,
          roomId,
        }}
      />
    ),
    []
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: any) => item._id || item.chatId, []);

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={"padding"}
        keyboardVerticalOffset={100}
        style={styles.content}
      >
        <ThemedView
          style={[styles.messagesContainer]}
          darkColor="#000"
          lightColor="#fff"
        >
          <FlatList
            data={chatCtx.messages}
            renderItem={RenderedCard}
            keyExtractor={keyExtractor}
            numColumns={1}
            initialNumToRender={10}
            getItemLayout={(data, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
            inverted={true}
            maxToRenderPerBatch={10}
            scrollEventThrottle={10} // Improves performance
            windowSize={10} // Adjust based on your needs
            onEndReachedThreshold={0.5} // Adjust sensitivity
            contentContainerStyle={styles.messageContentStyle}
            showsVerticalScrollIndicator={false}
          />
          {chatCtx.isTyping && <TypingIndicator />}
          <GroupMessageInput
            roomId={roomId}
            messageToRespondTo={messageToRespondTo}
            setMessageToRespondTo={setMessageToRespondTo}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 9,
  },
  messageContentStyle: {
    // backgroundColor: "red",
  },
  content: {
    flex: 1,
  },
});
