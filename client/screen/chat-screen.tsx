import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ChatContext } from "@/lib/context/chat-context";

const { height } = Dimensions.get("window");

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      contactName: string;
      phoneNumber: string;
    };
  };
};

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const chatCtx = useContext(ChatContext);

  const { contactName, phoneNumber } = route.params;

  useEffect(() => {
    if (contactName || phoneNumber) {
      chatCtx.joinRoom({ contactName, phoneNumber });
    }
  }, [route.params]);

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
      };
    }) => <MessageBubble message={item} />,
    []
  );

  return (
    <ThemedView
      style={styles.messagesContainer}
      darkColor="#000"
      lightColor="#fff"
    >
      <FlatList
        data={chatCtx.messages.map((msg: any) => ({
          ...msg,
          type: "text",
          isSender: msg.isSender ?? false,
        }))}
        renderItem={RenderedCard}
        keyExtractor={(item: any) => item._id}
        numColumns={1}
        scrollEventThrottle={16} // Improves performance
        // onEndReached={handleEndReached} // Trigger when reaching the end
        onEndReachedThreshold={0.5} // Adjust sensitivity
        inverted
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageInput receiverId={phoneNumber} />
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

  messageInput: {
    padding: 10,
  },
});
