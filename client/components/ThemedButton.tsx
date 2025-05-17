import { Pressable, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedButtonProps = {
  darkBackground?: string;
  lightBackground?: string;
  style?: any;
  onPress?: () => void;
  children: React.ReactNode;
};

const ThemedButton: React.FC<ThemedButtonProps> = ({
  style,
  darkBackground,
  lightBackground,
  children,
  onPress,
  ...rest
}) => {
  const color = useThemeColor(
    { light: darkBackground, dark: lightBackground },
    "text"
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: color },
        pressed && { opacity: 0.9 },
      ]}
    >
      {children}
    </Pressable>
  );
};
export default ThemedButton;

const styles = StyleSheet.create({
  btn: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
});
