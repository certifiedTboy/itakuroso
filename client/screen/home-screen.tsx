import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { createChatTable } from "@/helpers/database/chats";
import { createContactTable } from "@/helpers/database/contacts";
import { createRoomIdTable } from "@/helpers/database/room";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type HomeScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: HomeScreenInterface) => {
  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const { width, height } = useWindowDimensions();

  /**
   * useFocusEffect hook to create the contact and chat tables
   * when the HomeScreen is focused.
   */
  useFocusEffect(
    useCallback(() => {
      // Create the contact table if it doesn't exist
      const onCreateContactTable = async () => {
        await createContactTable();
        await createChatTable();
        await createRoomIdTable();
      };

      onCreateContactTable();
    }, [])
  );

  const openWebsite = async () => {
    const url = "https://www.linkedin.com/in/emmanuel-tosin-817257149";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <ThemedView
      style={styles.container}
      darkColor="#000"
      lightColor={Colors.light.background}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <ThemedView
            darkColor="#000"
            style={[{ width: width * 0.4, height: height * 0.2 }]}
          >
            <Image
              style={styles.image}
              source={require("@/assets/images/chat-bubble.png")}
            />
          </ThemedView>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.introText}>Itakurọsọ</Text>
        </View>

        <View style={styles.btnContainer}>
          <ThemedButton
            darkBackground={Colors.dark.btnBgc}
            lightBackground={Colors.light.btnBgc}
            onPress={() => navigation.navigate("reg-screen")}
          >
            <ThemedText style={styles.btnText}>Get Started!</ThemedText>
          </ThemedButton>
        </View>
        <View style={styles.footerTextContainer}>
          <ThemedText
            style={{
              textAlign: "center",
              fontFamily: "robotoMedium",
              marginTop: 20,
              fontSize: 13,
              color: textColor,
            }}
            onPress={() => openWebsite()}
          >
            Chat Freely, Stay Secure!
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
  },

  textContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,

    // marginBottom: 50,
  },

  introText: {
    fontSize: 45,
    fontWeight: "bold",
    fontFamily: "robotoBold",
  },

  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 90,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  btnContainer: {
    width: 300,
    marginHorizontal: "auto",
    marginTop: 40,
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
    fontFamily: "robotoMedium",
  },

  footerTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});

export default HomeScreen;
