import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";
import { Searchbar } from "react-native-paper";

const { width } = Dimensions.get("window");
const SearchInput = ({
  setShowSearch,
  searchQuery,
  showSearchInput,
  onSearchQuery,
}: {
  setShowSearch: () => void;
  showSearchInput: boolean;
  searchQuery: string;
  onSearchQuery: (input: string) => void;
}) => {
  // const [searchQuery, setSearchQuery] = useState("");

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const searchInputRef = useRef<TextInput>(null);

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

    if (showSearchInput) {
      searchInputRef.current?.focus();
    }
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
        ref={searchInputRef}
        inputStyle={{ color: textColor, marginTop: -8 }}
        placeholder="Search name or number..."
        placeholderTextColor={textColor}
        onChangeText={(text) => onSearchQuery(text)}
        value={searchQuery}
        onClearIconPress={() => console.log("Clear icon pressed")}
        onIconPress={() => setShowSearch()}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme === "dark" ? "#333" : "#fff",
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
    // height: 37,
  },
  searchInput: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.93,
  },
});
