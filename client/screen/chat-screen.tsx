import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import { ThemedView } from "@/components/ThemedView";
import { generateRoomId } from "@/helpers/chat-helpers";
import {
  // getLocalChatsByRoomId,
  insertChat,
} from "@/helpers/database/chats";
import { useGetChatsByRoomIdMutation } from "@/lib/apis/chat-apis";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
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

  useFocusEffect(
    useCallback(() => {
      if (!roomId) {
        chatCtx.joinRoom(
          { contactName, phoneNumber },
          { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email },
          generateRoomId()
        );
      } else {
        chatCtx.joinRoom(
          { contactName, phoneNumber },
          { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email },
          roomId
        );
        getChatsByRoomId({ roomId });
        // const onGetLocalChats = async () => {
        //   const result = await getLocalChatsByRoomId(roomId);

        //   console.log("local chats", result);
        // };

        // onGetLocalChats();
      }
    }, [roomId, contactName, phoneNumber, currentUser])
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
    }, [roomId, route.params, currentUser?.phoneNumber])
  );

  // Update context messages when fetched
  useEffect(() => {
    const updateLocalChats = async () => {
      await insertChat(data?.data);
    };
    if (isSuccess && data?.data && data.data.length > 0) {
      updateLocalChats();
      chatCtx.updateSocketMessages(data.data, currentUser);
    }
  }, [isSuccess]);

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

  return (
    <ThemedView
      style={styles.messagesContainer}
      darkColor="#000"
      lightColor="#fff"
    >
      <FlatList
        data={chatCtx.messages}
        renderItem={RenderedCard}
        keyExtractor={(item: any) => item._id}
        numColumns={1}
        scrollEventThrottle={16}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        // windowSize={5}
        // removeClippedSubviews

        inverted={true}
        onEndReachedThreshold={0.5}
        // onEndReached={() => {
        //   if (chatCtx.messages.length > 0) {
        //     setPageNum(pageNum + 1);
        //   }
        // }}
        // onStartReached={() => console.log("Start reached")}
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
    // alignItems: "flex-end",
    // backgroundColor: "red",
  },
  messageContentStyle: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
  },
});
