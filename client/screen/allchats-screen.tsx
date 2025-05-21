import MenuDropdown from "@/components/dropdown/MenuDropdown";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AuthContext } from "@/lib/context/auth-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { useCallback, useContext, useState } from "react";

import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import { Searchbar } from "react-native-paper";

import ChatCard from "@/components/chats/ChatCard";

type AllChatsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const AllChatsScreen = ({ navigation }: AllChatsScreenInterface) => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigation();

  const theme = useColorScheme();

  const authCtx = useContext(AuthContext);

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "background"
  );

  const options = [
    {
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      label: "Help",
      onPress: () => navigation.navigate("Help"),
    },
    {
      label: "Logout",
      onPress: async () => authCtx.logout(),
    },
  ];

  const messageList = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    sender: `John Doe ${index + 1}`,
    message: `Message that was send by a user at a point in time ${index + 1}`,
    time: `${index + 1} min ago`,
  }));

  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({ item }: { item: { sender: string; message: string; time: string } }) => (
      <ChatCard
        sender={item.sender}
        message={item.message}
        time={item.time}
        image={require("../assets/images/avatar.png")}
      />
    ),
    []
  );

  return (
    <>
      <FloatingBtn
        onNavigate={() => navigate.navigate("contact-lists-screen")}
      />
      <MenuDropdown options={options} />
      <View style={styles.contianer}>
        <Searchbar
          iconColor={textColor}
          inputStyle={{ color: textColor }}
          placeholder="Search"
          placeholderTextColor={textColor}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            margin: 10,
          }}
        />

        <View>
          <FlatList
            data={messageList}
            renderItem={RenderedCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1}
            scrollEventThrottle={16} // Improves performance
            // onEndReached={handleEndReached} // Trigger when reaching the end
            onEndReachedThreshold={0.5} // Adjust sensitivity
          />
        </View>
      </View>
    </>
  );
};

export default AllChatsScreen;

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
});
