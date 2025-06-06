import { generateRoomId } from "@/helpers/chat-helpers";
import { insertChat } from "@/helpers/database/chats";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { io } from "socket.io-client";

type ChatContextType = {
  messages: {
    senderId: string;
    message: string;
    _id: string;
    file?: string;
    createdAt: string;
    isSender?: boolean;
    type: string;
  }[];
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    roomId?: string
  ) => void;
  sendMessage: (
    message: string,
    otherUserId: string,
    roomId?: string,
    fileName?: string
  ) => void;
  updateSocketMessages: (messages: []) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    roomId?: string
  ) => {},
  sendMessage: (
    message: string,
    otherUserId: string,
    roomId?: string,
    fileName?: string
  ) => {},
  updateSocketMessages: (messages: []) => {},
});

const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [socketMessages, setSocketMessages] = useState<
    {
      senderId: string;
      message: string;
      _id: string;
      file?: string;
      createdAt: string;
      isSender?: boolean;
      type: string;
    }[]
  >([]);

  const { currentUser } = useSelector((state: any) => state.authState);

  const API_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

  const socket = useRef(io(API_URL));

  // join room function
  const joinRoom = (
    userId: { contactName: string; phoneNumber: string },
    roomId?: string
  ) => {
    let newRoomId;

    if (!roomId) {
      newRoomId = generateRoomId();
      AsyncStorage.setItem("roomId", newRoomId);
    }

    socket?.current.emit("joinRoom", {
      roomId: roomId ? roomId : newRoomId,
      userId,
      currentUserId: {
        phoneNumber: currentUser?.phoneNumber,
        email: currentUser?.email,
      },
    });
  };

  // send message function
  const sendMessage = async (
    message: string,
    otherUserId: string,
    roomId?: string,
    fileName?: string
  ) => {
    let existingRoomId;
    if (!roomId) {
      existingRoomId = await AsyncStorage.getItem("roomId");
    }

    socket.current.emit("message", {
      roomId: roomId ? roomId : existingRoomId,
      content: message,
      senderId: currentUser?.phoneNumber,
      fileName,
    });

    /**
     * save chat locally on sqlite storage
     */
    await insertChat({
      senderId: otherUserId,
      currentUserId: currentUser?.phoneNumber,
      message,
      roomId: roomId || existingRoomId || generateRoomId(),
    });
  };

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("message", (message: any) => {
      setSocketMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: message.senderId,
          message: message.message,
          _id: message._id,
          createdAt: message.createdAt,
          isSender: message.senderId === currentUser?.phoneNumber,
          file: message?.file,
          type: "text",
        },
      ]);
    });

    return () => {
      currentSocket.off("message");
    };
  }, [socket]);

  const updateSocketMessages = async (messages: []) => {
    return (
      messages &&
      messages.length > 0 &&
      messages?.map((message: any) =>
        setSocketMessages([
          ...message,
          {
            senderId: message.currentUserId,
            isSender: message.currentUserId === currentUser?.phoneNumber,
            message: message.message,
            _id: message.id,
            createdAt: message.timestamp,
            type: "text",
            file: message?.file,
          },
        ])
      )
    );
  };

  const value = {
    messages: socketMessages,
    joinRoom,
    sendMessage,
    updateSocketMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
