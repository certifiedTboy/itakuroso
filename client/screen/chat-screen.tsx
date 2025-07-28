import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import { ThemedView } from "@/components/ThemedView";
import { generateRoomId } from "@/helpers/chat-helpers";
import { getLocalChatsByRoomId } from "@/helpers/database/chats";
// import { useGetChatsByRoomIdMutation } from "@/lib/apis/chat-apis";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useState } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Animated, FlatList, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      contactName: string;
      phoneNumber: string;
      roomId: string;
      senderId: string;
      isRead: boolean;
    };
  };
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ChatScreen = ({ route }: ChatScreenProps) => {
  const [messageToRespondTo, setMessageToRespondTo] = useState<{
    message: string;
    _id: string;
  } | null>(null);

  // const [getChatsByRoomId, { data, isSuccess }] = useGetChatsByRoomIdMutation();
  const { currentUser } = useSelector((state: any) => state.authState);

  const chatCtx = useContext(ChatContext);
  const { contactName, phoneNumber, roomId } = route.params;

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
      (async () => {
        if (!roomId) {
          chatCtx.joinRoom(
            { contactName, phoneNumber },
            {
              phoneNumber: currentUser?.phoneNumber,
              email: currentUser?.email,
            },
            await generateRoomId(phoneNumber)
          );
        } else {
          chatCtx.joinRoom(
            { contactName, phoneNumber },
            {
              phoneNumber: currentUser?.phoneNumber,
              email: currentUser?.email,
            },
            roomId
          );
        }
      })();
    }, [])
  );

  // Update context messages when fetched
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const result =
          (await getLocalChatsByRoomId(
            roomId ? roomId : await generateRoomId(phoneNumber)
          )) ?? [];

        if (result && result.length > 0) {
          //@ts-ignore
          chatCtx.updateSocketMessages(result, currentUser);
        }
      })();
    }, [])
  );

  // Mark as read & leave room on blur
  useFocusEffect(
    useCallback(() => {
      if (
        route.params?.senderId !== currentUser?.phoneNumber &&
        !route.params?.isRead
      ) {
        chatCtx.markMessageAsRead(roomId);
      }

      return () => {
        chatCtx.leaveRoom({ phoneNumber: currentUser?.phoneNumber });
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
        }}
      />
    ),
    []
  );

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
          <AnimatedFlatList
            data={chatCtx.messages}
            renderItem={RenderedCard}
            keyExtractor={(item: any) => item._id || item.chatId}
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
          />

          <MessageInput
            receiverId={phoneNumber}
            roomId={roomId}
            messageToRespondTo={messageToRespondTo}
            setMessageToRespondTo={setMessageToRespondTo}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

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
