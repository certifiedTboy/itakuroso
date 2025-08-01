import { useThemeColor } from "@/hooks/useThemeColor";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import AiHintBubble from "./AiHintBubble";

const AiHintList = ({
  hintMessages,
  onPress,
}: {
  hintMessages: {
    id: number;
    text: string;
  }[];
  onPress: (message: string) => void;
}) => {
  const text = useThemeColor({ light: "#000", dark: "#fff" }, "text");

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 60 }}>
          <Image
            style={styles.aiIcon}
            source={require("@/assets/images/ai.gif")}
          />
          <Text style={[styles.hintText, { color: text }]}>
            How can I assist you today?
          </Text>
        </View>
        {hintMessages.map((hint: { id: number; text: string }) => (
          <AiHintBubble
            key={hint.id.toString()}
            message={hint.text}
            onPress={onPress}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default AiHintList;

const styles = StyleSheet.create({
  aiIcon: {
    width: 200,
    // height: 200,
    alignSelf: "center",
    // height: 50,
  },

  hintText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 10,
  },
});
