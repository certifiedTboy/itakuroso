// import { getChatsByRoomId } from "@/helpers/database/chats";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

type ChatContextType = {
  messages: {
    senderId: string;
    message: string;
    _id: string;
    createdAt: string;
    type: string;
    file?: string;
  }[];
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
  ) => void;
  sendMessage: (
    message: string,
    otherUserId: string,
    currentUser: { phoneNumber: string; email: string },
    roomId?: string,
    file?: string
  ) => void;
  updateSocketMessages: (
    messages: [],
    currentUser?: { phoneNumber: string; email: string }
  ) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
  ) => {},
  sendMessage: (
    message: string,
    otherUserId: string,
    currentUser: { phoneNumber: string; email: string },
    roomId?: string,
    file?: string
  ) => {},
  updateSocketMessages: (
    messages: [],
    currentUser?: { phoneNumber: string; email: string }
  ) => {},
});

const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [socketMessages, setSocketMessages] = useState<
    {
      senderId: string;
      message: string;
      _id: string;
      createdAt: string;
      type: string;
      file?: string;
    }[]
  >([]);

  const API_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

  const socket = useRef(io(API_URL));

  // join room function
  const joinRoom = (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
  ) => {
    socket?.current.emit("joinRoom", {
      roomId: roomId,
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
    currentUser: { phoneNumber: string; email: string },
    roomId?: string,
    file?: string
  ) => {
    socket.current.emit("message", {
      roomId: roomId,
      content: message,
      senderId: currentUser?.phoneNumber,
      file,
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
          file: message?.file,
          type: "text",
        },
      ]);
    });

    return () => {
      currentSocket.off("message");
    };
  }, [socket]);

  const updateSocketMessages = async (
    messages: [],
    currentUser: { phoneNumber: string; email: string }
  ) => {
    interface ChatMessage {
      __v: number;
      _id: string;
      chatRoomId: string;
      createdAt: string; // ISO date string
      message: string;
      roomId: string;
      senderId: string;
      updatedAt: string;
    }

    if (!messages || messages.length === 0) {
      return setSocketMessages([]);
    }

    const sortedMessages = [...messages].sort(
      (a: ChatMessage, b: ChatMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return setSocketMessages(
      // @ts-ignore
      sortedMessages?.map((message: any) => {
        return {
          senderId: message.senderId,
          isSender: message.senderId === currentUser?.phoneNumber,
          message: message.message,
          _id: message._id,
          createdAt: message.timestamp,
          type: "text",
          file: message?.file,
        };
      })
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
