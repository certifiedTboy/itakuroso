import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as ImagePicker from "expo-image-picker";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const NewGroupDetailsScreen = ({
  route,
}: {
  route: {
    params: {
      groupContacts: {
        phoneNumber: string;
        name: string;
        profilePicture: string;
      }[];
    };
    name: string;
    key: string;
  };
}) => {
  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const borderBottomColor = useThemeColor(
    { light: "#333", dark: "#fff" },
    "background"
  );

  // console.log(route.params);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled) {
      // onSendMessage({
      //   type: "image",
      //   content: `data:image/jpeg;base64,${result.assets[0].base64}`,
      // });
    }
  };

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["right"]}
    >
      <ThemedView darkColor={Colors.dark.bgc} lightColor={Colors.light.bgc}>
        <ScrollView contentContainerStyle={styles.contentContainerStyle}>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              <Ionicons name="images" size={30} color="#B1B1B1FF" />
            </TouchableOpacity>
            <TextInput
              placeholder="Group Name"
              style={[
                styles.input,
                { borderBottomColor, color: borderBottomColor },
              ]}
              placeholderTextColor={borderBottomColor}
            />
            <TouchableOpacity onPress={handleImagePick}>
              <Ionicons name="happy-outline" size={25} color="#B1B1B1FF" />
            </TouchableOpacity>
          </View>

          <View style={styles.contactList}>
            {route.params.groupContacts.map((contact) => (
              <View key={contact.phoneNumber}>
                <Text>{contact.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default NewGroupDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },

  inputContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginHorizontal: 10,
  },

  input: {
    borderBottomWidth: 2,
    width: "80%",
    fontFamily: "robotoMedium",
  },

  contactList: {
    height: 300,
    backgroundColor: "#ff0000",
    marginTop: 30,
    marginHorizontal: "auto",
    // width: "80%",
    width: "90%",
  },
});
