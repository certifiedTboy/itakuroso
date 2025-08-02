import { Colors } from "@/constants/Colors";
import { generateDbId } from "@/helpers/chat-helpers";
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
import { useSelector } from "react-redux";
import { EmojiPicker } from "../common/emjoi-picker/EmojiPicker";
import { EmojiType } from "../common/emjoi-picker/types";

type ChatInputProps = {
  hintMessage?: string;
  getHintMessage: (message: string) => void;
};

const AiMessageInput = ({ hintMessage, getHintMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string>("");

  const [inputHeight, setInputHeight] = useState(35);
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
   * control the height of the message input field
   */
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

  const showKeyboard = () => {
    setShowEmoji(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <>
      {showEmoji && (
        <View style={styles.emojiContainer}>
          <View
            style={[
              styles.container,
              {
                height:
                  inputHeight < heightRef.current
                    ? heightRef?.current
                    : inputHeight,

                backgroundColor: textInputBackgroundColor,
              },
            ]}
          >
            <View style={styles.row}>
              <TouchableOpacity onPress={() => showKeyboard()}>
                <MaterialIcons name="keyboard" size={27} color="#B1B1B1FF" />
              </TouchableOpacity>
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
                onFocus={() => showKeyboard()}
                editable={!isRecording}
                selectTextOnFocus={!isRecording}
                multiline
                ref={inputRef}
                onContentSizeChange={(event) =>
                  setInputHeight(event.nativeEvent.contentSize.height)
                }
              />

              <View style={{ marginLeft: 5 }}>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : record}
                >
                  <MaterialIcons
                    name={"keyboard-voice"}
                    size={27}
                    color={
                      isRecording ? Colors.light.errorText : Colors.light.btnBgc
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <EmojiPicker
            expandable={false}
            open={showEmoji}
            onClose={() => {
              setShowEmoji(false);
            }}
            onEmojiSelected={(emoji: EmojiType) =>
              setMessage((prev) => prev + emoji?.emoji)
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
            enableCategoryChangeAnimation={false}
          />
        </View>
      )}

      {!showEmoji && (
        <View
          style={[
            styles.container,
            {
              height:
                inputHeight < heightRef.current
                  ? heightRef?.current
                  : inputHeight,

              backgroundColor: textInputBackgroundColor,
            },
          ]}
        >
          <View style={styles.row}>
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowEmoji(!showEmoji);
                }}
              >
                <Ionicons name="happy-outline" size={27} color="#B1B1B1FF" />
              </TouchableOpacity>
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
                onFocus={() => showKeyboard()}
                editable={!isRecording}
                selectTextOnFocus={!isRecording}
                multiline
                ref={inputRef}
                onContentSizeChange={(event) =>
                  setInputHeight(event.nativeEvent.contentSize.height)
                }
              />

              <View style={{ marginLeft: 5 }}>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : record}
                >
                  <MaterialIcons
                    name="keyboard-voice"
                    size={27}
                    color={
                      isRecording ? Colors.light.errorText : Colors.light.btnBgc
                    }
                  />
                </TouchableOpacity>
              </View>
            </>
          </View>
        </View>
      )}
    </>
  );
};

export default AiMessageInput;

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

  previewImageContainer2: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    // marginVertical: 23,
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
    // marginLeft: -80,
    zIndex: 1,
  },
  emojiContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    // borderRadius: 20,
    // borderWidth: 1,
    // borderColor: "#ccc",
    marginHorizontal: 8,
    textAlignVertical: "top",
    fontSize: 20,
  },
});
