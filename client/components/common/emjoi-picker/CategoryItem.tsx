import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardContext } from "./context/keyboard-context";
import { Icon } from "./Icon";
import type { CategoryNavigationItem } from "./types";

type CategoryItemProps = {
  item: CategoryNavigationItem;
  index: number;
  handleScrollToCategory: (index: number) => void;
};

export const CategoryItem = ({
  item,
  index,
  handleScrollToCategory,
}: CategoryItemProps) => {
  const { activeCategoryIndex, theme, setActiveCategoryIndex } =
    React.useContext(KeyboardContext);

  const handleSelect = () => {
    handleScrollToCategory(index);
    setActiveCategoryIndex(index);
  };

  return (
    <TouchableOpacity onPress={handleSelect}>
      <View style={styles.container}>
        <Icon
          iconName={item.icon}
          isActive={activeCategoryIndex === index}
          normalColor={theme.category.icon}
          activeColor={theme.category.iconActive}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
    borderRadius: 6,
  },
  icon: { textAlign: "center" },
});
