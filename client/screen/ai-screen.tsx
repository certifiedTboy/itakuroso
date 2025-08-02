import AiHintList from "@/components/ai/AiHintList";
import AiMessageInput from "@/components/ai/AiMessageInput";
import AiMessageList from "@/components/ai/AiMessageList";
import TypingIndicator from "@/components/ai/TypingIndicator";
import { ThemedView } from "@/components/ThemedView";
import { hintMessages } from "@/helpers/ai-hint-messages";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AiChatContext } from "@/lib/context/aichat-context";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const AIScreen = () => {
  const { currentUser } = useSelector((state: any) => state.authState);
  const [hintMessage, setHintMessage] = useState<string>("");
  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const {
    joinAiRoom,
    aiMessages,
    isConnected,
    updateSocketMessages,
    isTyping,
  } = useContext(AiChatContext);

  useEffect(() => {
    return () => updateSocketMessages();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        if (currentUser && currentUser.phoneNumber && !isConnected) {
          joinAiRoom(currentUser?.phoneNumber, {
            phoneNumber: currentUser?.phoneNumber,
            email: currentUser?.email,
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [])
  );

  const getHintMessage = (message: string) => {
    setHintMessage(message);
  };

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
          {aiMessages.length === 0 ? (
            <AiHintList hintMessages={hintMessages} onPress={getHintMessage} />
          ) : (
            <AiMessageList aiMessages={aiMessages} />
          )}
          {isTyping && <TypingIndicator />}
          <AiMessageInput
            hintMessage={hintMessage}
            getHintMessage={getHintMessage}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AIScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  messagesContainer: {
    flex: 1,
    paddingHorizontal: 9,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },

  loaderContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
