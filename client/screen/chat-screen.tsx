import MessageBubble from "@/components/chats/MessageBubble";
import MessageInput from "@/components/chats/MessageInput";
import { ThemedView } from "@/components/ThemedView";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  // ScrollView,
  StyleSheet,
  // TouchableWithoutFeedback,
  View,
} from "react-native";

import { ChatContext } from "@/lib/context/chat-context";

let currentUser = "user1";

const { height } = Dimensions.get("window");

const messages = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  senderId: i % 2 === 0 ? "user1" : "user2",
  content: `This is an amazing application from a very talented developer`,
  type: "text",
  isSender: currentUser === (i % 2 === 0 ? "user1" : "user2") ? true : false,
  avatarUrl: "",
}));

// Replace with actual user ID

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
  const [chatMessages, setMessages] = useState(messages);
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
    ({ item }: { item: { content: string; name?: string; type: string } }) => (
      <MessageBubble message={item} />
    ),
    []
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView
        style={styles.messagesContainer}
        darkColor="#000"
        lightColor="#fff"
      >
        <View
          style={[
            isKeyboardVisible
              ? { marginBottom: 150 }
              : { marginBottom: 60, height: height * 0.85 },
          ]}
        >
          <FlatList
            data={chatMessages}
            renderItem={RenderedCard}
            keyExtractor={(item: any) => item.id}
            numColumns={1}
            scrollEventThrottle={16} // Improves performance
            // onEndReached={handleEndReached} // Trigger when reaching the end
            onEndReachedThreshold={0.5} // Adjust sensitivity
          />
        </View>

        <View
          style={[styles.messageInput, { bottom: isKeyboardVisible ? 80 : 0 }]}
        >
          <MessageInput receiverId={phoneNumber} />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    // height: "90%",
  },

  messagesContainer: {
    paddingHorizontal: 9,
    // marginBottom: 50,
  },

  // messageList: {
  //   marginBottom: 80,
  // },
  messageInput: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    padding: 10,
  },
});
