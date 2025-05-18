import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type IconProps = {
  color: string;
  size: number;
  name: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
};

const Icon = ({ color, size, name, onPress }: IconProps) => {
  return (
    <Pressable
      style={({ pressed }) => pressed && styles.pressed}
      onPress={onPress}
    >
      <Ionicons name={name} color={color} size={size} />
    </Pressable>
  );
};

export default Icon;

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
