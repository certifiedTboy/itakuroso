import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";

type ChatInputProps = {
  onSendMessage: (message: {
    type: string;
    content: string;
    name?: string;
  }) => void;
};

const MessageInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string>("");

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
      onSendMessage({
        type: "image",
        content: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  /**
   * handleFilePick is used to pick a file from the device's file system.
   * It uses the `expo-document-picker` library to handle file picking.
   */
  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    console.log(result);
  };

  const handleShowEmoji = () => {
    return setShowEmoji(!showEmoji);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage("");
    }
  };

  return (
    <View style={styles.container}>
      {/* {showEmoji && (
        <EmojiSelector
          onEmojiSelected={(emoji) => console.log(emoji)}
          showSearchBar={true}
          showTabs={true}
          // category={"all"}
          columns={8}
        />
      )} */}

      <View style={styles.row}>
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
        />

        {!isRecording && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: -80,
              zIndex: 1,
            }}
          >
            {
              <TouchableOpacity onPress={handleFilePick}>
                <Ionicons name="attach" size={35} color="#B1B1B1FF" />
              </TouchableOpacity>
            }

            {false && (
              <TouchableOpacity onPress={handleImagePick}>
                <Ionicons name="image" size={35} color="#B1B1B1FF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleShowEmoji}>
              <Ionicons name="happy-outline" size={35} color="#B1B1B1FF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginLeft: 5 }}>
          {message ? (
            <TouchableOpacity onPress={handleSend}>
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
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
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
