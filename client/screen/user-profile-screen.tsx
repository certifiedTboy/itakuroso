import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUploadProfileImageMutation } from "@/lib/apis/userApis";
import { AuthContext } from "@/lib/context/auth-context";
import * as ImagePicker from "expo-image-picker";
import { useContext } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useSelector } from "react-redux";
import dummyAvatar from "../assets/images/dummy-avatar.png";

const UserProfileScreen = () => {
  const { currentUser } = useSelector((state: any) => state.authState);

  const [uploadProfileImage, { isLoading }] = useUploadProfileImageMutation();

  const { logout } = useContext(AuthContext);

  const titleColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.btnBgc },
    "text"
  );

  /**
   * handleImagePick is used to pick an image from the device's library.
   * It uses the `expo-image-picker` library to handle image picking.
   */
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      const asset = result.assets[0];

      const formData = new FormData();
      formData.append("image", {
        uri:
          Platform.OS === "android"
            ? asset.uri
            : asset.uri.replace("file://", ""),
        name: asset.fileName,
        type: asset.mimeType,
      } as any);

      await uploadProfileImage(formData);
    }
  };

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.profileImageContainer}>
        <Pressable style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
          {currentUser?.profilePicture ? (
            <Avatar.Image
              size={150}
              source={{ uri: currentUser?.profilePicture }}
            />
          ) : (
            <Avatar.Image size={150} source={dummyAvatar} />
          )}
        </Pressable>

        <Pressable onPress={handleImagePick}>
          <Text style={[styles.profileEditText, { color: titleColor }]}>
            Edit
          </Text>
        </Pressable>

        {isLoading && <LoaderSpinner />}
      </View>

      <View style={styles.detailsContainer}>
        <View>
          <Icon name="mail" size={24} color={titleColor} />
        </View>
        <View>
          <Text style={[styles.title, { color: titleColor }]}>Email</Text>
          <Text style={styles.value}>{currentUser?.email}</Text>
        </View>
      </View>

      <View style={styles.detailsContainerNext}>
        <View>
          <Icon name="call" size={24} color={titleColor} />
        </View>
        <View>
          <Text style={[styles.title, { color: titleColor }]}>Phone</Text>
          <Text style={styles.value}>{currentUser?.phoneNumber}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          pressed && { opacity: 0.8 },
          styles.detailsContainerNext2,
        ]}
        onPress={logout}
      >
        <View>
          <Icon name="trash" size={24} color={Colors.light.errorText} />
        </View>
        <View>
          <Text style={[styles.title, { color: Colors.light.errorText }]}>
            Delete Account
          </Text>
          <Text style={styles.value}>All message data will be deleted</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 30,
    marginTop: 60,
    marginBottom: 35,
    gap: 30,
  },

  detailsContainerNext: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 30,
    marginBottom: 35,
    // marginTop: 20,
    gap: 30,
  },

  detailsContainerNext2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 30,
    // marginTop: 20,
    gap: 30,
  },

  profileEditText: {
    fontSize: 18,
    marginTop: 30,
    fontWeight: "500",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "robotoMedium",
  },

  value: {
    fontSize: 15,
    color: Colors.light.icon,
    marginTop: 4,
    fontFamily: "robotoRegular",
    fontWeight: 600,
  },
});
