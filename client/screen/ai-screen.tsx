import AiMessageBubble from "@/components/ai/AiMessageBubble";
import AiMessageInput from "@/components/ai/AiMessageInput";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext } from "react";
import { Animated, FlatList, StyleSheet } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const AIScreen = () => {
  const { currentUser } = useSelector((state: any) => state.authState);
  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

  const { joinAiRoom, aiMessages } = useContext(ChatContext);

  useFocusEffect(
    useCallback(() => {
      if (currentUser && currentUser.phoneNumber) {
        joinAiRoom(currentUser?.phoneNumber, {
          phoneNumber: currentUser?.phoneNumber,
          email: currentUser?.email,
        });
      }
    }, [currentUser])
  );

  // Memoized render function
  const RenderedCard = useCallback(
    ({ item }: { item: any }) => (
      <AiMessageBubble
        message={{
          ...item,
          isSender: item.senderId === currentUser?.phoneNumber,
        }}
      />
    ),
    []
  );

  console.log("AI Messages:", aiMessages[0]);

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
            data={aiMessages}
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

          <AiMessageInput />
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

  messageContentStyle: {
    // backgroundColor: "red",
  },
});
