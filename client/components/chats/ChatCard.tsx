import { Colors } from "@/constants/Colors";
import { formatDate } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import { useSelector } from "react-redux";
import { ThemedText } from "../ThemedText";
import Icon from "../ui/Icon";

type ChatCardProps = {
  members: { name: string; profileImage?: string; phoneNumber: string }[];
  message?: string;
  time: string;
  image?: any;
  isRead?: boolean;
  containsFile?: boolean;
  roomId: string;
  isSender?: boolean;
  senderId: string;
  onNavigate?: () => void;
};

const ChatCard = ({
  members,
  message,
  time,
  image,
  roomId,
  isRead,
  containsFile,
  onNavigate,
  isSender,
  senderId,
}: ChatCardProps) => {
  const navigation = useNavigation();

  const { currentUser } = useSelector((state: any) => state.authState);

  const { width } = Dimensions.get("window");

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
      onPress={() => {
        // @ts-ignore
        navigation.navigate("chat-screen", {
          contactName: members?.find(
            (member: any) => member.phoneNumber !== currentUser?.phoneNumber
          )?.name,
          phoneNumber: members?.find(
            (member: any) => member.phoneNumber !== currentUser?.phoneNumber
          )?.phoneNumber,
          roomId,
          senderId,
          isRead,
        });
      }}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
        styles.cardContainer,
        { backgroundColor: cardBg },
      ]}
    >
      {/* Image + Sender/Message Block */}
      <View style={styles.leftContainer}>
        <Avatar.Image size={50} source={image} />
        <View style={[{ maxWidth: width * 0.62 }, styles.textContainer]}>
          <ThemedText style={styles.sender}>
            {members?.find(
              (member: any) => member.phoneNumber !== currentUser?.phoneNumber
            )?.name ||
              members?.find(
                (member: any) => member.phoneNumber !== currentUser?.phoneNumber
              )?.phoneNumber}
          </ThemedText>
          <View style={styles.messageRow}>
            {/* <Icon name="checkmark-done-outline" size={14} color="#969494FF" /> */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.message, { color: textColor }]}
            >
              {message}
            </Text>
          </View>
        </View>
      </View>

      {/* Time and Counter */}
      <View style={styles.rightContainer}>
        <ThemedText
          darkColor="#969494FF"
          lightColor={Colors.light.btnBgc}
          style={styles.time}
        >
          {formatDate(time)}
        </ThemedText>

        <View style={styles.counterContainer}>
          {containsFile && (
            <View>
              <Icon
                name="document-attach-outline"
                size={18}
                color="#969494FF"
              />
            </View>
          )}
          {!isRead && isSender && (
            <View style={styles.counter}>
              <ThemedText style={styles.counterText}></ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatCard;

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

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    // marginTop: 4,
  },
  counter: {
    backgroundColor: Colors.light.errorText,
    width: 15,
    height: 15,
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
