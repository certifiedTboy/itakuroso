import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  return (
    <ThemedView
      style={styles.container}
      darkColor="transparent"
      lightColor="transparent"
    >
      {/* <ThemedText>Home Screen </ThemedText> */}

      <View style={styles.textContainer}>
        <ThemedText style={styles.introText}>Welcome to Itakurọsọ</ThemedText>
      </View>

      <View style={styles.imageContainer}>
        <ThemedView style={styles.imageBgContainer} darkColor="" lightColor="">
          <Image
            style={styles.image}
            source={require("@/assets/images/chat-bubble.png")}
          />
        </ThemedView>
      </View>

      <View style={styles.btnContainer}>
        <ThemedButton darkBackground="#0263FFFF" lightBackground="#0263FFFF">
          <ThemedText style={styles.btnText}>Continue</ThemedText>
        </ThemedButton>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // marginTop: 50,
    height: Dimensions.get("window").height / 1.8,
  },

  textContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 80,
  },

  introText: {
    fontSize: 30,
    fontWeight: "bold",
  },

  imageContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  imageBgContainer: {
    width: "70%",
    padding: 20,
    borderRadius: 30,
  },

  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  btnContainer: {
    width: 300,
    marginHorizontal: "auto",
    marginTop: 80,
    // justifyContent: "center",
    // alignItems: "center",
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
  },
});

export default HomeScreen;
