import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-paper";

const GroupDetailsCard = ({
  contactName,
  phoneNumber,
  profileImage,
}: {
  contactName: string;
  phoneNumber: string;
  profileImage: string;
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

export default memo(GroupDetailsCard);

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },

  textContainer: {
    width: 55,
  },

  contactName: {
    fontFamily: "robotoMedium",
    fontWeight: "500",
  },
});
