import * as React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { EmojiSizes, JsonEmoji } from "./types";

type Props = {
  item: JsonEmoji;
  emojiSize: number;
  index: number;
  onPress: (emoji: JsonEmoji) => void;
  onLongPress: (
    emoji: JsonEmoji,
    emojiIndex: number,
    emojiSizes: EmojiSizes
  ) => void;
  selectedEmojiStyle?: StyleProp<ViewStyle>;
  isSelected?: boolean;
};

const SingleEmojiComponent = (p: Props) => {
  const handlePress = () => p.onPress(p.item);
  const handleLongPress = (e: GestureResponderEvent) => {
    // @ts-ignore
    e.target.measure((_x, _y, width, height) => {
      p.onLongPress(p.item, p.index, { width, height });
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.container}
    >
      <View
        pointerEvents={"none"}
        style={[styles.emojiWrapper, p.selectedEmojiStyle]}
      >
        <Text style={[styles.emoji, { fontSize: p.emojiSize }]}>
          {p.item.emoji}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

SingleEmojiComponent.displayName = "SingleEmoji";

export const SingleEmoji = React.memo(
  SingleEmojiComponent,
  (prevProps, nextProps) => prevProps.isSelected === nextProps.isSelected
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiWrapper: {
    padding: 4,
  },
  emoji: { color: "#000" },
});
