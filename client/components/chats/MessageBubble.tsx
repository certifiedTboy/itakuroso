import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImagePreviewModal from "./ImagePreviewModal";

type Message = {
  message: string;
  senderId: string;
  _id: string;
  createdAt: string;
  type: string;
  isSender: boolean;
  file?: string;
};

const MessageBubble = ({ message }: { message: Message }) => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const handleOpenFile = () => {
    Linking.openURL(message.message);
  };

  return (
    <>
      <ImagePreviewModal
        isVisible={imagePreviewVisible}
        imageUrl={message?.file || ""}
        onClose={() => setImagePreviewVisible(!imagePreviewVisible)}
      />

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
        {!message.isSender && (
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        )}

        <View
          style={[
            styles.container,
            message.isSender ? styles.sender : styles.receiver,

            !message.isSender && {
              backgroundColor: cardBg,
            },
          ]}
        >
          {message.type === "file" && (
            <TouchableOpacity
              style={styles.fileButton}
              onPress={handleOpenFile}
            >
              <MaterialCommunityIcons name="file" size={30} color="#007AFF" />
              <Text style={styles.fileName}>
                {message.message || "Open File"}
              </Text>
            </TouchableOpacity>
          )}

          {message.type === "text" && (
            <Text
              style={[
                message.isSender ? styles.senderText : styles.receiverText,
                message.file && { marginBottom: 5 },
              ]}
            >
              {message.message}
            </Text>
          )}

          {message.file && (
            <Pressable onPress={() => setImagePreviewVisible(true)}>
              <Image source={{ uri: message.file }} style={styles.image} />
            </Pressable>
          )}

          {message.type === "audio" && (
            <TouchableOpacity style={styles.audioButton}>
              <Ionicons name="play-circle" size={30} color="#fff" />
              <Text style={styles.audioText}>Play Audio</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

export default MessageBubble;

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
    fontWeight: "400",
    color: "#333",
  },

  receiverText: {
    fontSize: 14,
    fontWeight: "400",
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
});
