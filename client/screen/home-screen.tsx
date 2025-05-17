import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, StyleSheet, View } from "react-native";

type HomeScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: HomeScreenInterface) => {
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
    width: "70%",
    padding: 20,
    borderRadius: 15,
  },

  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  btnContainer: {
    width: 300,
    marginHorizontal: "auto",
    marginTop: 10,
    // justifyContent: "center",
    // alignItems: "center",
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
  },
});

export default HomeScreen;
