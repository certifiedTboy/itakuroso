import { DeleteButton } from "@/components/common/emjoi-picker/DeleteButton";
import { EmojiPicker } from "@/components/common/emjoi-picker/EmojiPicker";
import { EmojiType } from "@/components/common/emjoi-picker/types";
import GroupDetailsContactList from "@/components/group/GroupDetailsContactList";
import { ThemedView } from "@/components/ThemedView";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { Colors } from "@/constants/Colors";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateGroupChatMutation } from "@/lib/apis/chat-apis";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const NewGroupDetailsScreen = ({
  route,
}: {
  route: {
    params: {
      groupContacts: {
        phoneNumber: string;
        name: string;
        profileImage: string;
        id: string;
      }[];
    };
    name: string;
    key: string;
  };
}) => {
  const [groupProfileImage, setGroupProfileImage] = useState<string | null>(
    null
  );

  const [groupName, setGroupName] = useState<string>("");
  const [members, setMembers] = useState<string[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);

  const { keyboardVisible, closeKeyboard } = useKeyboard();

  const [createGroupChat, { isLoading, isSuccess, error }] =
    useCreateGroupChatMutation();

  const inputRef = useRef<TextInput>(null);

  const { currentUser } = useSelector((state: any) => state.authState);

  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  const borderBottomColor = useThemeColor(
    { light: "#333", dark: "#fff" },
    "background"
  );

  const backgroundColor = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const textColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: "#969494FF" },
    "text"
  );

  const textInputBackgroundColor = useThemeColor(
    {
      light: Colors.light.bgc,
      dark: Colors.dark.bgc,
    },
    "background"
  );

  useEffect(() => {
    if (route.params.groupContacts.length > 0) {
      const memberIds = route.params.groupContacts.map((contact) => contact.id);
      setMembers(memberIds);
    }
  }, [route.params.groupContacts]);

  useEffect(() => {
    if (keyboardVisible) {
      setShowEmoji(false);
    }
  }, [keyboardVisible]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setGroupProfileImage(result.assets[0].uri);
    }
  };

  const showKeyboard = () => {
    setShowEmoji(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 70);
  };

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["right"]}
    >
      <ThemedView darkColor={Colors.dark.bgc} lightColor={Colors.light.bgc}>
        {/* <ScrollView contentContainerStyle={styles.contentContainerStyle}> */}
        <View style={styles.inputContainer}>
          {!groupProfileImage ? (
            <TouchableOpacity
              style={styles.imagePickerIcon}
              onPress={handleImagePick}
            >
              <Ionicons name="images" size={20} color="#B1B1B1FF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleImagePick}>
              <Avatar.Image size={45} source={{ uri: groupProfileImage }} />
            </TouchableOpacity>
          )}
          <TextInput
            placeholder="Group Name"
            style={[
              styles.input,
              { borderBottomColor, color: borderBottomColor },
            ]}
            placeholderTextColor={borderBottomColor}
            onChangeText={setGroupName}
            value={groupName}
            ref={inputRef}
          />

          {showEmoji ? (
            <TouchableOpacity onPress={() => showKeyboard()}>
              <MaterialIcons name="keyboard" size={27} color="#B1B1B1FF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setShowEmoji(!showEmoji);
                closeKeyboard();
              }}
            >
              <Ionicons name="happy-outline" size={25} color="#B1B1B1FF" />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.contactList, { backgroundColor }]}>
          <View>
            <Text style={[styles.contactListTitle, { color: textColor }]}>
              Group Members: {route.params.groupContacts.length}
            </Text>
          </View>

          {route.params.groupContacts.length > 0 && (
            <GroupDetailsContactList
              groupContacts={route.params.groupContacts}
            />
          )}
        </View>

        {/* </ScrollView> */}
      </ThemedView>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        {showEmoji && (
          <EmojiPicker
            expandable={false}
            open={showEmoji}
            onClose={() => {
              setShowEmoji(false);
            }}
            onEmojiSelected={(emoji: EmojiType) =>
              setGroupName((prev) => prev + emoji?.emoji)
            }
            categoryPosition="top"
            theme={{
              backdrop: "#16161888",
              knob: Colors.light.btnBgc,
              container: textInputBackgroundColor,
              header: "#fff",
              skinTonesContainer: textInputBackgroundColor,
              category: {
                icon: Colors.light.btnBgc,
                iconActive: "#fff",
                container: textInputBackgroundColor,
                containerActive: Colors.light.btnBgc,
              },
            }}
            allowMultipleSelections={true}
            hideHeader={true}
            emojiSize={30}
            enableCategoryChangeAnimation={true}
            customButtons={[
              <DeleteButton
                key="deleteButton"
                onPress={() => setGroupName((prev) => prev.slice(0, -2))}
                style={({ pressed }) => ({
                  opacity: pressed ? 1 : 0.8,
                  padding: 10,
                  borderRadius: 100,
                })}
                iconNormalColor={Colors.light.btnBgc}
                iconActiveColor={Colors.light.btnBgc}
              />,
            ]}
          />
        )}
        <FloatingBtn
          onNavigate={() =>
            // @ts-ignore
            navigation.navigate("new-group-details-screen", { groupContacts })
          }
          iconName="check-circle"
          style={styles.floatingBtn}
        />
      </View>
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
    marginHorizontal: 20,
  },

  imagePickerIcon: {
    borderBlockColor: "#333",
    borderWidth: 1,
    padding: 10,
    borderRadius: 50,
  },

  input: {
    borderBottomWidth: 2,
    width: "80%",
    fontFamily: "robotoMedium",
  },

  contactList: {
    // backgroundColor: "#ff0000",
    marginTop: 30,
    marginHorizontal: "auto",
    // width: "80%",
    width: "90%",
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 }, // iOS
    shadowOpacity: 0.2, // iOS
    shadowRadius: 1.41, // iOS
    padding: 10,
    borderRadius: 10,
  },

  contactListTitle: {
    fontFamily: "robotoMedium",
    fontSize: 14,
    marginBottom: 5,
  },

  floatingBtn: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});
