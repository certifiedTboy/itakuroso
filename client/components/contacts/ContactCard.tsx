import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import { ThemedText } from "../ThemedText";

const { width } = Dimensions.get("window");

type ChatCardProps = {
  contactName?: string;
  phoneNumber: string;
  isActiveUser?: boolean;
  contactImage: any;
  roomId?: string;
  onNavigate?: () => void;
};

const ContactCard = ({
  contactName,
  phoneNumber,
  isActiveUser,
  contactImage,
  onNavigate,
  roomId,
}: ChatCardProps) => {
  const navigation = useNavigation();

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const textColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: "#969494FF" },
    "text"
  );

  return (
    <Pressable
      onPress={() =>
        //@ts-ignore
        navigation.navigate("chat-screen", { contactName, phoneNumber, roomId })
      }
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
        styles.cardContainer,
        { backgroundColor: cardBg },
      ]}
    >
      <View style={styles.leftContainer}>
        {contactImage ? (
          <Avatar.Image size={50} source={contactImage} />
        ) : (
          <Avatar.Text
            size={50}
            label={contactName[0]}
            style={{ backgroundColor: Colors.light.btnBgc }}
          />
        )}
        <View style={styles.textContainer}>
          <ThemedText style={styles.sender}>{contactName}</ThemedText>
          <View style={styles.messageRow}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.message, { color: textColor }]}
            >
              {phoneNumber}
            </Text>
          </View>
        </View>
      </View>

      {!isActiveUser && (
        <View style={styles.rightContainer}>
          <ThemedText
            darkColor="#969494FF"
            lightColor={Colors.light.btnBgc}
            style={styles.time}
          >
            Invite
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 1.41, // iOS
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 5,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: width * 0.62,
    gap: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 50,
  },
  sender: {
    fontSize: 15,
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
  },
  counter: {
    backgroundColor: "#0263FFFF",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  counterText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});
