import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Icon from "../ui/Icon";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import useFileUpload from "@/hooks/useFileUpload";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ChatContext } from "@/lib/context/chat-context";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import EmojiModal from "react-native-emoji-modal";
import { useSelector } from "react-redux";
import ImagePreviewModal from "./ImagePreviewModal";

type ChatInputProps = {
  receiverId: string;
  roomId: string;
  messageToRespondTo?: {
    message: string;
    _id: string;
  } | null;
};

const MessageInput = ({
  receiverId,
  roomId,
  messageToRespondTo,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string>("");
  const [imagePreviewIsVisible, setImagePreviewIsVisible] = useState(false);
  // const ref = useRef<IWaveformRef>(null);

  const { currentUser } = useSelector((state: any) => state.authState);

  const { uploadFile, uploadedFile, isUploading, clearUploadedFile } =
    useFileUpload();

  /**
   * chatContext
   */
  const chatCtx = useContext(ChatContext);

  const placeholderTextColor = useThemeColor(
    { light: "#333", dark: "#fff" },
    "text"
  );

  const textInputBackgroundColor = useThemeColor(
    {
      light: Colors.light.bgc,
      dark: Colors.dark.bgc,
    },
    "background"
  );

  const textInputColor = useThemeColor({ light: "#333", dark: "#fff" }, "text");
  const theme = useColorScheme();

  /**
   * AudioRecorder is used to record audio messages.
   * It uses the `expo-audio` library to handle audio recording.
   */
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(audioUri);

  /**
   * record is used to start the audio recording.
   * It prepares the audio recorder and starts recording.
   */
  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  /**
   * stopRecording is used to stop the audio recording.
   * It will save the recorded audio to the `audioRecorder.uri`.
   */
  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    setAudioUri(audioRecorder.uri ?? "");
    setIsRecording(false);
  };

  /**
   * playAudio is used to play the recorded audio.
   * It uses the `expo-audio` library to handle audio playback.
   */
  useEffect(() => {
    if (audioUri) {
      player.play();
    }
  }, [audioUri]);

  /**
   * requestPermissions is used to request microphone permissions.
   * It uses the `expo-audio` library to handle permissions.
   */
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }
    })();
  }, []);

  /**
   * handleImagePick is used to pick an image from the device's library.
   * It uses the `expo-image-picker` library to handle image picking.
   */
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled) {
      // onSendMessage({
      //   type: "image",
      //   content: `data:image/jpeg;base64,${result.assets[0].base64}`,
      // });
    }
  };

  /**
   * handleFilePick is used to pick a file from the device's file system.
   * It uses the `expo-document-picker` library to handle file picking.
   */
  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});

    if (result && result?.assets && typeof uploadFile === "function") {
      await uploadFile(result?.assets[0]?.uri);
    }
  };

  // console.log("file upload error: ", fileUploadError);
  // console.log("uploaded file:", uploadedFile);

  const handleShowEmoji = () => {
    return setShowEmoji(!showEmoji);
  };

  const handleSend = async () => {
    if (message.trim().length > 0 || uploadedFile?.uri) {
      await chatCtx.sendMessage(
        message,
        receiverId,
        {
          phoneNumber: currentUser?.phoneNumber,
          email: currentUser?.email,
        },
        roomId,
        uploadedFile?.uri
      );
      setMessage("");
      clearUploadedFile();
    }
  };

  // console.log(uploadedFile);
  // console.log(messageToRespondTo);

  return (
    <>
      <ImagePreviewModal
        isVisible={imagePreviewIsVisible}
        onClose={() => setImagePreviewIsVisible(!imagePreviewIsVisible)}
        imageUrl={uploadedFile.uri}
      />
      <View style={styles.container}>
        {showEmoji && (
          <View style={styles.emojiContainer}>
            <EmojiModal
              onEmojiSelected={(emoji) => setMessage((prev) => prev + emoji)}
              onPressOutside={() => console.log("pressed outside")}
              searchStyle={{
                backgroundColor: theme === "dark" ? "#333" : "#E8E8E8FF",
              }}
              emojiSize={35}
              containerStyle={{ backgroundColor: textInputBackgroundColor }}
              // modalStyle={}
            />
          </View>
        )}

        {uploadedFile && uploadedFile.uri && (
          <View style={styles.previewImageContainer}>
            <Pressable
              onPress={() => setImagePreviewIsVisible(true)}
              style={styles.imagePressable}
            >
              <Image
                style={styles.previewImage}
                source={{ uri: uploadedFile?.uri }}
              />
            </Pressable>

            <View style={styles.iconContainer}>
              <Icon
                name="close-circle-outline"
                size={25}
                color="#fff"
                onPress={() => console.log("pressed")}
              />
            </View>
          </View>
        )}
        {messageToRespondTo && messageToRespondTo.message && (
          <View style={styles.responseTextContainer}>
            <Text
              style={{ color: textInputColor, fontWeight: 400, fontSize: 13 }}
            >
              {messageToRespondTo.message}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          {/* {audioUri && (
          <Waveform
            mode="static"
            ref={ref}
            path={audioUri}
            candleSpace={2}
            candleWidth={4}
            scrubColor="white"
            onPlayerStateChange={(playerState) => console.log(playerState)}
            onPanStateChange={(isMoving) => console.log(isMoving)}
          />
        )} */}

          <TextInput
            placeholderTextColor={placeholderTextColor}
            style={[
              styles.input,
              {
                backgroundColor: textInputBackgroundColor,
                color: textInputColor,
              },
            ]}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            onFocus={() => setShowEmoji(false)}
            editable={!isRecording}
            selectTextOnFocus={!isRecording}
          />

          {!isRecording && (
            <View style={styles.recordingContainer}>
              {
                <TouchableOpacity onPress={handleFilePick}>
                  <Ionicons name="attach" size={35} color="#B1B1B1FF" />
                </TouchableOpacity>
              }

              {false && (
                <TouchableOpacity onPress={handleImagePick}>
                  <Ionicons name="image" size={25} color="#B1B1B1FF" />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleShowEmoji}>
                <Ionicons name="happy-outline" size={35} color="#B1B1B1FF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ marginLeft: 5 }}>
            {message || uploadedFile.uri.trim().length > 0 ? (
              <TouchableOpacity onPress={async () => await handleSend()}>
                <Ionicons name="send" size={35} color={Colors.light.btnBgc} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={isRecording ? stopRecording : record}>
                <MaterialIcons
                  name={"keyboard-voice"}
                  size={35}
                  color={
                    isRecording ? Colors.light.errorText : Colors.light.btnBgc
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePressable: {
    width: 40,
    borderRadius: 10,
  },
  previewImageContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 23,
  },

  iconContainer: {
    height: 40,

    justifyContent: "center",
  },

  previewImage: {
    width: "100%",
    height: 30,
    resizeMode: "contain",
    padding: 10,
    backgroundColor: "#7E7A7AFF",
  },

  responseTextContainer: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    // alignItems: "flex-start",
    paddingHorizontal: 10,
    marginVertical: 10,
    // marginBottom: 40,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -80,
    zIndex: 1,
  },
  emojiContainer: { position: "absolute", bottom: 60, left: 0, right: 0 },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 8,
    height: 40,
  },
});
