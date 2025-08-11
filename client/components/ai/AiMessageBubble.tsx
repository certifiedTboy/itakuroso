import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import AnimatedTyping from "./AnimatedTyping";

type Message = {
  message: string;
  createdAt: string;
  isSender: boolean;
};

const MessageBubble = ({ isSender, message, createdAt }: Message) => {
  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  return (
    <>
      {isSender ? (
        <View
          style={[
            {
              flexDirection: "row",
            },
            isSender ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
          ]}
        >
          <View style={[styles.container, styles.sender]}>
            <View>
              <Text style={[styles.senderText]}>{message}</Text>
            </View>

            <Text style={styles.messageTime}>{formatDate(createdAt)}</Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            {
              flexDirection: "row",
              alignSelf: "flex-start",
            },
          ]}
        >
          <View
            style={[
              styles.container,
              styles.receiver,

              {
                backgroundColor: cardBg,
              },
            ]}
          >
            <AnimatedTyping text={[message]} />

            {/* <Text style={styles.messageTime}>{formatDate(createdAt)}</Text> */}
          </View>
        </View>
      )}
    </>
  );
};

export default memo(MessageBubble);

const styles = StyleSheet.create({
  container: {
    maxWidth: "90%",
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
