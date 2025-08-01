import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";
import Icon from "../ui/Icon";

const AiHintBubble = ({
  message,
  onPress,
}: {
  message: string;
  onPress: (message: string) => void;
}) => {
  const { width } = Dimensions.get("window");

  const textColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.btnBgc },
    "text"
  );

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );
  return (
    <Pressable
      onPress={() => onPress(message)}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
        styles.container,
        styles.lightStyle,
        { width: width * 0.9, backgroundColor: cardBg },
      ]}
    >
      <Icon name="document-text-outline" size={20} color={textColor} />
      <Text style={[styles.hintText, { color: textColor }]}>{message}</Text>
    </Pressable>
  );
};

export default AiHintBubble;

const styles = StyleSheet.create({
  container: {
    maxWidth: "90%",
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  hintText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  lightStyle: {
    // backgroundColor: "#fff",
    alignSelf: "flex-start",
    // borderTopLeftRadius: 0,
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 1.41, // iOS
  },
});
