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
import { Dimensions, Image, Linking, StyleSheet, View } from "react-native";

type HomeScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }: HomeScreenInterface) => {
  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

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
    console.log("Opening website...");
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
      darkColor="transparent"
      lightColor="transparent"
    >
      <View style={styles.textContainer}>
        <ThemedText style={styles.introText}>Welcome to Itakurọsọ</ThemedText>
      </View>

      <View style={styles.imageContainer}>
        <ThemedView style={styles.imageBgContainer}>
          <Image
            style={styles.image}
            source={require("@/assets/images/chat-bubble.png")}
          />
        </ThemedView>
      </View>

      <View style={styles.btnContainer}>
        <ThemedButton
          darkBackground={Colors.dark.btnBgc}
          lightBackground={Colors.light.btnBgc}
          onPress={() => navigation.navigate("reg-screen")}
        >
          <ThemedText style={styles.btnText}>Continue</ThemedText>
        </ThemedButton>
      </View>

      <View style={styles.footerTextContainer}>
        <ThemedText
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 15,
            color: textColor,
          }}
          onPress={() => openWebsite()}
        >
          See who created me!
        </ThemedText>
      </View>
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
    marginTop: 80,
    marginBottom: 50,
  },

  introText: {
    fontSize: 30,
    fontWeight: "bold",
  },

  imageContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 50,
  },

  imageBgContainer: {
    width: width * 0.7,
    padding: 20,
    borderRadius: 15,
  },

  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  btnContainer: {
    width: 100,
    marginHorizontal: "auto",
    marginTop: 10,
    // justifyContent: "center",
    // alignItems: "center",
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
  },

  footerTextContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});

export default HomeScreen;
