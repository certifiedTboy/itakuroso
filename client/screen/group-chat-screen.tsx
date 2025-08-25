import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Text, View } from "react-native";

const GroupChatScreen = () => {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      return () => {
        // @ts-ignore
        navigation.navigate("main-tabs", { index: 1 });
      };
    }, [])
  );

  return (
    <View>
      <Text>Group Chat Screen</Text>
    </View>
  );
};

export default GroupChatScreen;
