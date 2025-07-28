import * as React from "react";
import { FAB } from "react-native-paper";

const FloatingBtn = ({
  onNavigate,
  iconName,
  style,
  children,
}: {
  onNavigate: () => void;
  iconName?: string;
  style?: object;
  children?: React.ReactNode;
}) =>
  children ? (
    children
  ) : (
    <FAB
      icon={iconName || ""}
      style={{ ...style }}
      onPress={() => onNavigate()}
    />
  );

export default FloatingBtn;
