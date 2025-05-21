import * as React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

const FloatingBtn = ({ onNavigate }: { onNavigate: () => void }) => (
  <FAB
    icon="account-multiple-plus-outline"
    style={styles.fab}
    onPress={() => onNavigate()}
  />
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});

export default FloatingBtn;
