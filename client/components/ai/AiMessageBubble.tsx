import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AnimatedTyping from "./AnimatedTyping";

import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type Message = {
  message: string;
  senderId: string;
  _id: string;
  createdAt: string;
  isSender: boolean;
};

const MessageBubble = ({ message }: { message: Message }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const swipeableRef = useRef(null);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  return (
    <Animated.View style={{ opacity }}>
      <GestureHandlerRootView>
        {message?.isSender ? (
          <Swipeable
            ref={swipeableRef}
            onSwipeableOpen={() => {
              // @ts-ignore
              swipeableRef.current?.close();
            }}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                },
                message.isSender
                  ? { alignSelf: "flex-end" }
                  : { alignSelf: "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.container,
                  message.isSender ? styles.sender : styles.receiver,

                  !message.isSender && {
                    backgroundColor: cardBg,
                  },
                ]}
              >
                <View>
                  <Text
                    style={[
                      message.isSender
                        ? styles.senderText
                        : styles.receiverText,
                    ]}
                  >
                    {message.message}
                  </Text>
                </View>

                <Text style={styles.messageTime}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            </View>
          </Swipeable>
        ) : (
          <Swipeable
            onSwipeableOpen={() => {
              // @ts-ignore
              swipeableRef.current?.close();
            }}
            ref={swipeableRef}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                },
                message.isSender
                  ? { alignSelf: "flex-end" }
                  : { alignSelf: "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.container,
                  message.isSender ? styles.sender : styles.receiver,

                  !message.isSender && {
                    backgroundColor: cardBg,
                  },
                ]}
              >
                <AnimatedTyping text={[message.message]} />

                <Text style={styles.messageTime}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            </View>
          </Swipeable>
        )}
      </GestureHandlerRootView>
    </Animated.View>
  );
};

export default memo(MessageBubble);

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 10,
    borderRadius: 15,
  },
  sender: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 1.41, // iOS
  },

  receiver: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 1.41, // iOS
  },
  senderText: {
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
  },

  receiverText: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.light.btnBgc,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.btnBgc,
    borderRadius: 10,
    padding: 8,
  },
  audioText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "500",
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    marginLeft: 8,
    color: "#007AFF",
    textDecorationLine: "underline",
  },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 15,
    marginRight: 6,
  },

  messageTime: {
    fontSize: 10,
    fontWeight: 500,
    marginVertical: 2,
    color: "#888888",
  },

  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
});
