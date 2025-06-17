import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import { ThemedView } from "@/components/ThemedView";
import { useGetChatsByRoomIdMutation } from "@/lib/apis/chat-apis";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";

const { height } = Dimensions.get("window");

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

const ChatScreen = ({ route }: ChatScreenProps) => {
  const [messageToRespondTo, setMessageToRespondTo] = useState<{
    message: string;
    _id: string;
  } | null>(null);

  const [getChatsByRoomId, { data, isSuccess }] = useGetChatsByRoomIdMutation();
  const { currentUser } = useSelector((state: any) => state.authState);

  const chatCtx = useContext(ChatContext);
  const { contactName, phoneNumber, roomId } = route.params;

  const flatListRef = useRef<FlatList>(null);

  // Join or fetch chats on mount
  useEffect(() => {
    if (!roomId) {
      chatCtx.joinRoom(
        { contactName, phoneNumber },
        { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email }
      );
    } else {
      chatCtx.joinRoom(
        { contactName, phoneNumber },
        { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email },
        roomId
      );
      getChatsByRoomId(roomId);
    }
  }, [roomId, contactName, phoneNumber, currentUser]);

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
      };
    }, [roomId, route.params, currentUser?.phoneNumber])
  );

  // Update context messages when fetched
  useEffect(() => {
    if (isSuccess && data?.data?.length > 0) {
      chatCtx.updateSocketMessages(data.data, currentUser);
    }
  }, [isSuccess, data?.data?.length, currentUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatCtx.messages.length > 0) {
      InteractionManager.runAfterInteractions(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [chatCtx.messages]);

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
    [currentUser?.phoneNumber]
  );

  if (!chatCtx || !currentUser) return null;

  return (
    <ThemedView
      style={styles.messagesContainer}
      darkColor="#000"
      lightColor="#fff"
    >
      <FlatList
        data={chatCtx.messages}
        ref={flatListRef}
        renderItem={RenderedCard}
        keyExtractor={(item: any) => item._id}
        numColumns={1}
        // scrollEventThrottle={16}
        // initialNumToRender={20}
        // maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        onEndReached={() => console.log("End reached")}
        contentContainerStyle={styles.messageContentStyle}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageInput
          receiverId={phoneNumber}
          roomId={roomId}
          messageToRespondTo={messageToRespondTo}
          setMessageToRespondTo={setMessageToRespondTo}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 9,
  },
  messageContentStyle: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
});
