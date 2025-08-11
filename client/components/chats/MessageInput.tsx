import { Colors } from "@/constants/Colors";
import { generateDbId } from "@/helpers/chat-helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useDeleteFileMutation,
  useUploadFileMutation,
} from "@/lib/apis/chat-apis";
import { ChatContext } from "@/lib/context/chat-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
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
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { DeleteButton } from "../common/emjoi-picker/DeleteButton";
import { EmojiPicker } from "../common/emjoi-picker/EmojiPicker";
import { EmojiType } from "../common/emjoi-picker/types";
import LoaderSpinner from "../spinner/LoaderSpinner";
import Icon from "../ui/Icon";
import ImagePreviewModal from "./ImagePreviewModal";

type ChatInputProps = {
  receiverId: string;
  roomId: string;
  messageToRespondTo?: {
    message: string;
    _id: string;
    file?: string;
  } | null;
  setMessageToRespondTo?: ({
    message,
    _id,
  }: {
    message: string;
    _id: string;
  }) => void;
};

const MessageInput = ({
  receiverId,
  roomId,
  messageToRespondTo,
  setMessageToRespondTo,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string>("");
  const [imagePreviewIsVisible, setImagePreviewIsVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");
  const [inputHeight, setInputHeight] = useState(35);
  const inputRef = useRef<TextInput>(null);
  const heightRef = useRef<number>(85);

  const { currentUser } = useSelector((state: any) => state.authState);

  const [uploadFile, { data, isLoading, isSuccess, error }] =
    useUploadFileMutation();

  const [deleteFile, { isSuccess: fileDeletedSuccess }] =
    useDeleteFileMutation();

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

      if (inputHeight >= 168) {
        heightRef.current = 169;
      }
    }, [inputHeight])
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
   * controls the height of the message input field
   */
  useEffect(() => {
    if (messageToRespondTo?.message) {
      inputRef.current?.focus();
    }
  }, [messageToRespondTo, messageToRespondTo?.message]);

  /**
   * update file url and public id after pre-uploading a file
   */
  useEffect(() => {
    if (isSuccess && data?.data?.secureUrl) {
      setImageUri(data?.data?.secureUrl);
      setPublicId(data?.data?.publicId);
    }
  }, [isSuccess]);

  /**
   * reset imageUri and publicId after file deletion is successful
   * this is to ensure that the image preview is removed from the UI
   */
  useEffect(() => {
    if (fileDeletedSuccess) {
      setImageUri("");
      setPublicId("");
    }
  }, [fileDeletedSuccess]);

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
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (
      !result.canceled &&
      result.assets?.length &&
      typeof uploadFile === "function"
    ) {
      const asset = result.assets[0];

      const formData = new FormData();
      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? asset.uri
            : asset.uri.replace("file://", ""),
        name: asset.name,
        type: asset.mimeType,
      } as any);

      await uploadFile(formData);
    }
  };

  /**
   * handleSend is used to send a message.
   * It checks if the message is not empty or if an image is selected.
   * If so, it calls the `sendMessage` method from the chat context.
   * It also resets the message input and image preview after sending.
   */
  const handleSend = async () => {
    if (message.trim().length > 0 || imageUri) {
      chatCtx.sendMessage({
        chatId: generateDbId(),
        content: message,
        senderId: currentUser?.phoneNumber,
        receiverId,
        roomId,
        file: imageUri,
        replyTo: {
          replyToId: messageToRespondTo?._id!,
          replyToMessage: messageToRespondTo?.message!,
          replyToSenderId: currentUser?.phoneNumber,
        },
      });

      setMessage("");
      setImageUri("");
      setInputHeight(40);
      // @ts-ignore
      setMessageToRespondTo && setMessageToRespondTo(null);
    }
  };

  const onChangeText = (text: string) => {
    chatCtx.triggerTypingIndicator(roomId);

    setMessage(text);
  };

  const showKeyboard = () => {
    setShowEmoji(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 70);
  };

  return (
    <>
      {imageUri && imagePreviewIsVisible && (
        <ImagePreviewModal
          isVisible={imagePreviewIsVisible}
          onClose={() => setImagePreviewIsVisible(!imagePreviewIsVisible)}
          imageUrl={imageUri}
        />
      )}

      {isLoading && (
        <View style={styles.loaderContainer}>
          <LoaderSpinner />
        </View>
      )}

      {messageToRespondTo && messageToRespondTo.message && (
        <View style={styles.responseTextContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            textBreakStrategy="balanced"
            style={{ color: textInputColor, fontWeight: 400, fontSize: 13 }}
          >
            {messageToRespondTo.message}
          </Text>

          <View style={styles.iconContainer}>
            <Icon
              name="close-circle-outline"
              size={25}
              color={placeholderTextColor}
              onPress={() =>
                // @ts-ignore
                setMessageToRespondTo && setMessageToRespondTo(null)
              }
            />
          </View>
        </View>
      )}

      {imageUri && (
        <View style={styles.previewImageContainer}>
          <Pressable
            onPress={() => setImagePreviewIsVisible(true)}
            style={styles.imagePressable}
          >
            <Image style={styles.previewImage} source={{ uri: imageUri }} />
          </Pressable>

          <View style={styles.iconContainer}>
            <Icon
              name="close-circle-outline"
              size={25}
              color={placeholderTextColor}
              onPress={() => deleteFile(publicId.split("/").pop())}
            />
          </View>
        </View>
      )}

      {showEmoji && (
        <View style={styles.emojiContainer}>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <LoaderSpinner />
            </View>
          )}

          {imageUri && (
            <View style={styles.previewImageContainer2}>
              <Pressable
                onPress={() => setImagePreviewIsVisible(true)}
                style={styles.imagePressable}
              >
                <Image style={styles.previewImage} source={{ uri: imageUri }} />
              </Pressable>

              <View style={styles.iconContainer}>
                <Icon
                  name="close-circle-outline"
                  size={25}
                  color={placeholderTextColor}
                  onPress={() => deleteFile(publicId.split("/").pop())}
                />
              </View>
            </View>
          )}

          {messageToRespondTo && messageToRespondTo.message && (
            <View style={styles.responseTextContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                textBreakStrategy="balanced"
                style={{ color: textInputColor, fontWeight: 400, fontSize: 13 }}
              >
                {messageToRespondTo.message}
              </Text>

              <View style={styles.iconContainer}>
                <Icon
                  name="close-circle-outline"
                  size={25}
                  color={placeholderTextColor}
                  onPress={() =>
                    // @ts-ignore
                    setMessageToRespondTo && setMessageToRespondTo(null)
                  }
                />
              </View>
            </View>
          )}
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
            <View
              style={[
                styles.row,
                inputHeight > 44
                  ? { alignItems: "flex-end" }
                  : { alignItems: "center" },
              ]}
            >
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
                onChangeText={onChangeText}
                onFocus={() => showKeyboard()}
                editable={!isRecording}
                selectTextOnFocus={!isRecording}
                multiline
                ref={inputRef}
                onContentSizeChange={(event) =>
                  event.nativeEvent.contentSize.height < 169
                    ? setInputHeight(event.nativeEvent.contentSize.height)
                    : setInputHeight(168)
                }
              />

              {!isRecording && (
                <View style={styles.recordingContainer}>
                  {
                    <TouchableOpacity onPress={handleFilePick}>
                      <Ionicons name="attach" size={27} color="#B1B1B1FF" />
                    </TouchableOpacity>
                  }

                  {false && (
                    <TouchableOpacity onPress={handleImagePick}>
                      <Ionicons name="image" size={25} color="#B1B1B1FF" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={{ marginLeft: 5 }}>
                {message || data?.data?.secureUrl?.trim().length > 0 ? (
                  <TouchableOpacity onPress={async () => await handleSend()}>
                    <Ionicons
                      name="send"
                      size={27}
                      color={Colors.light.btnBgc}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : record}
                  >
                    <MaterialIcons
                      name={"keyboard-voice"}
                      size={27}
                      color={
                        isRecording
                          ? Colors.light.errorText
                          : Colors.light.btnBgc
                      }
                    />
                  </TouchableOpacity>
                )}
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
            enableCategoryChangeAnimation={true}
            customButtons={[
              <DeleteButton
                key="deleteButton"
                onPress={() => setMessage((prev) => prev.slice(0, -2))}
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
          <View
            style={[
              styles.row,
              inputHeight > 44
                ? { alignItems: "flex-end" }
                : { alignItems: "center" },
            ]}
          >
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
                onChangeText={onChangeText}
                onFocus={() => showKeyboard()}
                editable={!isRecording}
                selectTextOnFocus={!isRecording}
                multiline
                ref={inputRef}
                onContentSizeChange={(event) =>
                  event.nativeEvent.contentSize.height < 169
                    ? setInputHeight(event.nativeEvent.contentSize.height)
                    : setInputHeight(168)
                }
              />

              {!isRecording && (
                <View style={styles.recordingContainer}>
                  {
                    <TouchableOpacity onPress={handleFilePick}>
                      <Ionicons name="attach" size={27} color="#B1B1B1FF" />
                    </TouchableOpacity>
                  }

                  {false && (
                    <TouchableOpacity onPress={handleImagePick}>
                      <Ionicons name="image" size={25} color="#B1B1B1FF" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={{ marginLeft: 5 }}>
                {message || data?.data?.secureUrl?.trim().length > 0 ? (
                  <TouchableOpacity onPress={async () => await handleSend()}>
                    <Ionicons
                      name="send"
                      size={27}
                      color={Colors.light.btnBgc}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : record}
                  >
                    <MaterialIcons
                      name="keyboard-voice"
                      size={27}
                      color={
                        isRecording
                          ? Colors.light.errorText
                          : Colors.light.btnBgc
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          </View>
        </View>
      )}
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
    // alignItems: "center",
  },
  imagePressable: {
    width: 40,
    borderRadius: 10,
  },
  previewImageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  previewImageContainer2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  loaderContainer: {
    // flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    // marginVertical: 23,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 10,
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
