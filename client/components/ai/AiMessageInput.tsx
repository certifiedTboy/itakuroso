import { Colors } from "@/constants/Colors";
import { generateDbId } from "@/helpers/chat-helpers";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AiChatContext } from "@/lib/context/aichat-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import { useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiModal from "react-native-emoji-modal";
import { useSelector } from "react-redux";
const AiMessageInput = ({
  hintMessage,
  getHintMessage,
}: {
  hintMessage?: string;
  getHintMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const inputRef = useRef<TextInput>(null);
  const heightRef = useRef<number>(85);

  const { currentUser } = useSelector((state: any) => state.authState);

  /**
   * chatContext
   */
  const { sendAiMessage } = useContext(AiChatContext);

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
   * handleShowEmoji is used to toggle the visibility of the emoji picker.
   * It sets the `showEmoji` state to true or false.
   */
  const handleShowEmoji = () => {
    return setShowEmoji(!showEmoji);
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

  useFocusEffect(
    useCallback(() => {
      heightRef.current = 50;
    }, [])
  );

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
   * useEffect to handle hint messages.
   * If a hint message is provided or clicked by the user, it will send the message to the AI chat.
   */
  useEffect(() => {
    if (hintMessage) {
      sendAiMessage({
        chatId: generateDbId(),
        content: hintMessage,
        senderId: currentUser?.phoneNumber,
        roomId: currentUser?.phoneNumber,
      });

      getHintMessage("");
    }
  }, [hintMessage]);

  /**
   * handleSend is used to send the message to the AI chat.
   * It checks if the message is not empty and then sends it.
   * It also resets the input field and height.
   */
  const handleSend = async () => {
    if (message.trim().length > 0) {
      sendAiMessage({
        chatId: generateDbId(),
        content: message,
        senderId: currentUser?.phoneNumber,
        roomId: currentUser?.phoneNumber,
      });

      setMessage("");

      setInputHeight(40);
    }
  };

  return (
    <>
      <View style={[styles.container, { height: heightRef.current }]}>
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

        <View style={styles.row}>
          <TextInput
            placeholderTextColor={placeholderTextColor}
            style={[
              styles.input,
              {
                backgroundColor: textInputBackgroundColor,
                color: textInputColor,
                height: inputHeight,
              },
            ]}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            editable={!isRecording}
            selectTextOnFocus={!isRecording}
            multiline
            ref={inputRef}
            onContentSizeChange={(event) =>
              setInputHeight(event.nativeEvent.contentSize.height)
            }
          />

          <View style={styles.recordingContainer}>
            <TouchableOpacity onPress={handleShowEmoji}>
              <Ionicons name="happy-outline" size={35} color="#B1B1B1FF" />
            </TouchableOpacity>
          </View>

          <View style={{ marginLeft: 5 }}>
            {message ? (
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

export default AiMessageInput;

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 5,

    // bottom: 25,
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

  loaderContainer: {
    flex: 1,
    flexDirection: "row",
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
    justifyContent: "space-between",
    // alignItems: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    // marginVertical: 10,
    // marginBottom: 40,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -47,
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
    textAlignVertical: "top",
  },
});
