import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";

import { useFocusEffect } from "@react-navigation/native";

import { useGetChatsByRoomIdMutation } from "@/lib/apis/chat-apis";

import { ThemedView } from "@/components/ThemedView";
import { ChatContext } from "@/lib/context/chat-context";

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

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [messageToRespondTo, setMessageToRespondTo] = useState<{
    message: string;
    _id: string;
  } | null>(null);

  const [getChatsByRoomId, { data, error, isSuccess }] =
    useGetChatsByRoomIdMutation();

  const { currentUser } = useSelector((state: any) => state.authState);

  const chatCtx = useContext(ChatContext);

  const { contactName, phoneNumber, roomId } = route.params;

  const flatListRef = useRef(null);

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
  }, [route.params]);

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
        // console.log("Screen is unfocused");
      };
    }, [])
  );

  useEffect(() => {
    const onGetExistingMessages = async () => {
      await chatCtx.updateSocketMessages(data?.data, currentUser);
    };

    if (isSuccess && data?.data) {
      onGetExistingMessages();
    }
  }, [isSuccess]);

  /**
   * this was implemented to help the positioning of the chat input
   * when the keyboard is open and when it is closed
   */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // console.log("Socket Messages: ", chatCtx.messages);
  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({
      item,
    }: {
      item: {
        message: string;
        senderId: string;
        _id: string;
        createdAt: string;
        type: "text";
        isSender: boolean;
        file?: string;
        setMessageToRespondTo: ({
          message,
          _id,
        }: {
          message: string;
          _id: string;
        }) => void;
      };
    }) => (
      <MessageBubble
        message={{
          ...item,
          isSender: item.senderId === currentUser?.phoneNumber,
          setMessageToRespondTo: setMessageToRespondTo,
        }}
      />
    ),
    []
  );

  useEffect(() => {
    // if (chatCtx.messages.length > 0) {
    //@ts-ignore
    flatListRef.current?.scrollToEnd({ animated: true });
    // }
  }, [chatCtx.messages]);

  return (
    <ThemedView
      style={[styles.messagesContainer]}
      darkColor="#000"
      lightColor="#fff"
    >
      <FlatList
        data={chatCtx.messages}
        ref={flatListRef}
        renderItem={RenderedCard}
        keyExtractor={(item: any) => item._id}
        numColumns={1}
        scrollEventThrottle={16} // Improves performance
        // onEndReached={handleEndReached} // Trigger when reaching the end
        onEndReachedThreshold={0.5} // Adjust sensitivity
        contentContainerStyle={styles.messageContentStyle}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageInput
          receiverId={phoneNumber}
          roomId={roomId}
          messageToRespondTo={messageToRespondTo}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  messagesContainer: {
    paddingHorizontal: 9,
    flex: 1,
  },

  messageContentStyle: { flexGrow: 1, justifyContent: "flex-end" },

  messageInput: {
    padding: 10,
  },
});
