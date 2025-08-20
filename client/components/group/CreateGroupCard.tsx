import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "../ui/Icon";

const CreateGroupCard = ({
  contactName,
  phoneNumber,
  profileImage,
  onPress,
}: {
  contactName: string;
  phoneNumber: string;
  profileImage: string;
  onPress: (phoneNumber: string) => void;
}) => {
  const contactNameColor = useThemeColor(
    { dark: "#CBC6C6FF", light: "#3E3E3EFF" },
    "text"
  );

  return (
    <View style={styles.container}>
      {profileImage ? (
        <Avatar.Image size={50} source={{ uri: profileImage }} />
      ) : (
        <Avatar.Text
          size={50}
          label={contactName && contactName![0].charAt(0).toUpperCase()}
          style={{ backgroundColor: Colors.light.btnBgc }}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          { opacity: pressed ? 0.5 : 1 },
          styles.removeBtn,
        ]}
      >
        <Icon
          name="close-circle-sharp"
          onPress={() => onPress(phoneNumber)}
          size={25}
          color={contactNameColor}
        />
      </Pressable>

      <View style={styles.textContainer}>
        <Text
          style={[{ color: contactNameColor }, styles.contactName]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {contactName}
        </Text>
      </View>
    </View>
  );
};

export default memo(CreateGroupCard);

const styles = StyleSheet.create({
  container: {
    margin: 12,
  },

  removeBtn: {
    marginTop: -20,
    marginLeft: "auto",
  },

  textContainer: {
    width: 55,
  },

  contactName: {
    fontFamily: "robotoMedium",
  },
});
