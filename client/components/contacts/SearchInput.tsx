import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, useColorScheme } from "react-native";
import { Searchbar } from "react-native-paper";

const { width } = Dimensions.get("window");
const SearchInput = ({
  setShowSearch,
  showSearchInput,
}: {
  setShowSearch: () => void;
  showSearchInput: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: showSearchInput ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: showSearchInput ? 0 : -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showSearchInput]);
  const theme = useColorScheme();

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "background"
  );

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        styles.searchContainer,
      ]}
    >
      <Searchbar
        iconColor={textColor}
        icon="arrow-left"
        inputStyle={{ color: textColor, marginVertical: -10 }}
        placeholder="Search name or number..."
        placeholderTextColor={textColor}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onIconPress={() => setShowSearch()}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme === "dark" ? "#333" : "#fff",

            // margin: 10,
          },
        ]}
      />
    </Animated.View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  searchContainer: {
    width: width * 0.93,
    height: 37,
  },
  searchInput: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
