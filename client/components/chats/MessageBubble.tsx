import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  // TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Icon from "../ui/Icon";
import ImagePreviewModal from "./ImagePreviewModal";

type Message = {
  message: string;
  senderId: string;
  _id: string;
  createdAt: string;
  isSender: boolean;
  messageStatus: string;
  setMessageToRespondTo: ({
    message,
    _id,
  }: {
    message: string;
    _id: string;
  }) => void;
  file?: string;

  replyTo?: { replyToId: string; replyToMessage: string; senderId?: string };
};

const MessageBubble = ({ message }: { message: Message }) => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const swipeableRef = useRef(null);

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const actionIconColor = useThemeColor(
    { light: "#333", dark: "#fff" },
    "text"
  );

  // const handleOpenFile = () => {
  //   Linking.openURL(message.message);
  // };

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <Icon name="return-up-back-outline" size={25} color={actionIconColor} />
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.rightAction}>
      <Icon name="return-up-back-outline" size={25} color={actionIconColor} />
    </View>
  );

  const getMessageDetails = (_id: string, messageText: string) => {
    return message.setMessageToRespondTo({ _id, message: messageText });
  };

  return (
    <>
      <ImagePreviewModal
        isVisible={imagePreviewVisible}
        imageUrl={message?.file || ""}
        onClose={() => setImagePreviewVisible(!imagePreviewVisible)}
      />

      <GestureHandlerRootView>
        {message?.isSender ? (
          <Swipeable
            renderRightActions={renderRightActions}
            ref={swipeableRef}
            onSwipeableOpen={() => {
              getMessageDetails(message._id, message.message);
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
              {/* {!message.isSender && (
                <Image
                  source={require("../../assets/images/avatar.png")}
                  style={styles.avatar}
                />
              )} */}

              <View style={[styles.container, styles.sender]}>
                {/* {message.type === "file" && (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={handleOpenFile}
                  >
                    <MaterialCommunityIcons
                      name="file"
                      size={30}
                      color="#007AFF"
                    />
                    <Text style={styles.fileName}>
                      {message.message || "Open File"}
                    </Text>
                  </TouchableOpacity>
                )} */}

                <View>
                  {message?.replyTo && message?.replyTo?.replyToMessage && (
                    <Text
                      style={{ color: "#888888" }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      textBreakStrategy="balanced"
                    >
                      {message?.replyTo?.replyToMessage}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.senderText,
                      message.file && { marginBottom: 5 },
                    ]}
                  >
                    {message.message}
                  </Text>
                </View>

                {message.file && (
                  <Pressable onPress={() => setImagePreviewVisible(true)}>
                    <Image
                      source={{ uri: message.file }}
                      style={styles.image}
                    />
                  </Pressable>
                )}

                {/* {message.type === "audio" && (
                  <TouchableOpacity style={styles.audioButton}>
                    <Ionicons name="play-circle" size={30} color="#fff" />
                    <Text style={styles.audioText}>Play Audio</Text>
                  </TouchableOpacity>
                )} */}

                <Text style={styles.messageTime}>
                  {formatDate(message.createdAt)}
                </Text>

                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  {message?.messageStatus === "sent" && (
                    <Icon
                      name="checkmark-circle-sharp"
                      size={15}
                      color={cardBg}
                    />
                  )}

                  {message?.messageStatus === "delivered" && (
                    <Icon
                      name="checkmark-done-circle-sharp"
                      size={15}
                      color={cardBg}
                    />
                  )}

                  {message?.messageStatus === "red" && (
                    <Icon
                      name="checkmark-done-circle-sharp"
                      size={15}
                      color={cardBg}
                    />
                  )}
                </View>
              </View>
            </View>
          </Swipeable>
        ) : (
          <Swipeable
            renderLeftActions={renderLeftActions}
            onSwipeableOpen={() => {
              getMessageDetails(message._id, message.message);
              // @ts-ignore
              swipeableRef.current?.close();
            }}
            ref={swipeableRef}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                  alignSelf: "flex-start",
                },
              ]}
            >
              {/* {!message.isSender && (
                <Image
                  source={require("../../assets/images/avatar.png")}
                  style={styles.avatar}
                />
              )} */}

              <View
                style={[
                  styles.container,
                  styles.receiver,
                  {
                    backgroundColor: cardBg,
                  },
                ]}
              >
                {/* {message.type === "file" && (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={handleOpenFile}
                  >
                    <MaterialCommunityIcons
                      name="file"
                      size={30}
                      color="#007AFF"
                    />
                    <Text style={styles.fileName}>
                      {message.message || "Open File"}
                    </Text>
                  </TouchableOpacity>
                )} */}

                {message?.replyTo && message?.replyTo?.replyToMessage && (
                  <Text
                    style={{ color: "#888" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    textBreakStrategy="balanced"
                  >
                    {message?.replyTo?.replyToMessage}
                  </Text>
                )}

                <Text
                  style={[
                    styles.receiverText,
                    message.file && { marginBottom: 5 },
                  ]}
                >
                  {message.message}
                </Text>

                {message.file && (
                  <Pressable onPress={() => setImagePreviewVisible(true)}>
                    <Image
                      source={{ uri: message.file }}
                      style={styles.image}
                    />
                  </Pressable>
                )}

                {/* {message.type === "audio" && (
                  <TouchableOpacity style={styles.audioButton}>
                    <Ionicons name="play-circle" size={30} color="#fff" />
                    <Text style={styles.audioText}>Play Audio</Text>
                  </TouchableOpacity>
                )} */}

                <Text style={styles.messageTime}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            </View>
          </Swipeable>
        )}
      </GestureHandlerRootView>
    </>
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
