import React, { useContext } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

import { ChatContext } from "@/lib/context/chat-context";

const ChatBubbleDropdown = ({
  menuVisible,
  setMenuVisible,
  menuPosition,
  setMenuPosition,
  chatId,
  roomId,
  receiverId,
  isSender,
}: {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  menuPosition: { x: number; y: number };
  setMenuPosition: (position: { x: number; y: number }) => void;
  chatId: string;
  roomId: string;
  receiverId: string;
  isSender: boolean;
}) => {
  const { handleDeleteChatById, handleDeleteMessageForEveryone } =
    useContext(ChatContext);

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );
  const handleOptionSelect = (option: string) => {
    setMenuVisible(false);
    setMenuPosition({ x: 0, y: 0 }); // Reset position after selection
    Alert.alert(`Selected: ${option}`);
  };

  return (
    <View style={styles.container}>
      {menuVisible && (
        <Modal
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => {
            setMenuVisible(false);
            setMenuPosition({ x: 0, y: 0 }); // Reset position on close
          }}
        >
          <TouchableOpacity
            style={styles.contextMenuOverlay}
            activeOpacity={1}
            onPress={() => {
              setMenuVisible(false);
              setMenuPosition({ x: 0, y: 0 }); // Reset position on close
            }}
          >
            <View
              style={[
                styles.contextMenu,
                {
                  top: menuPosition.y - 10,
                  left: menuPosition.x - 100,
                  backgroundColor: cardBg,
                },
              ]}
            >
              {isSender && (
                <TouchableOpacity
                  style={styles.contextOption}
                  onPress={() =>
                    handleDeleteMessageForEveryone(chatId, roomId, receiverId)
                  }
                >
                  <Text
                    style={[{ color: textColor }, styles.contextOptionText]}
                  >
                    Delete for Everyone
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.contextOption]}
                onPress={() => handleOptionSelect("Copy")}
              >
                <Text style={[{ color: textColor }, styles.contextOptionText]}>
                  Copy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextOption}
                onPress={() => handleOptionSelect("Forward")}
              >
                <Text style={[{ color: textColor }, styles.contextOptionText]}>
                  Forward
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextOption}
                onPress={() => handleDeleteChatById(chatId, roomId)}
              >
                <Text style={[{ color: textColor }, styles.contextOptionText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default ChatBubbleDropdown;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },

  contextMenuOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contextMenu: {
    position: "absolute",
    borderRadius: 8,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contextOption: {
    padding: 15,
  },

  contextOptionText: {
    fontSize: 14,
    fontFamily: "robotoMedium",
  },
});
