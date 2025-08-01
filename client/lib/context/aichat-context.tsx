import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const API_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

type AiChatContextType = {
  aiMessages: {
    senderId: string;
    message: string;
    _id: string;
    createdAt: string;
  }[];
  isConnected: boolean;
  isTyping: boolean;

  joinAiRoom: (
    roomId: string,
    currentUserData: { phoneNumber: string; email: string }
  ) => void;
  sendAiMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    roomId?: string;
  }) => void;
  updateSocketMessages: () => void;
};

export const AiChatContext = createContext<AiChatContextType>({
  aiMessages: [
    {
      senderId: "",
      message: "",
      _id: "",
      createdAt: "",
    },
  ],
  isConnected: false,
  isTyping: false,
  joinAiRoom: (
    roomId: string,
    currentUserData: { phoneNumber: string; email: string }
  ) => {},
  sendAiMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    roomId?: string;
  }) => {},
  updateSocketMessages: () => {},
});

const AiChatContextProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef(io(API_URL));
  const isConntectedRef = useRef(false);
  const [isTyping, setIsTyping] = useState(false);
  /**
   * chat message state data
   */

  const [aiMessages, setAiMessages] = useState<
    { senderId: string; message: string; _id: string; createdAt: string }[]
  >([]);

  /**
   * send message function
   */
  const sendAiMessage = async (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    roomId?: string;
  }) => {
    socket.current.emit("ai-message", messageData);
  };

  /**
   * join AI room function
   */
  const joinAiRoom = (
    roomId: string,
    currentUserData: { phoneNumber: string; email: string }
  ) => {
    socket?.current.emit("joinAiRoom", {
      roomId: roomId,
      currentUserData: {
        phoneNumber: currentUserData?.phoneNumber,
        email: currentUserData?.email,
      },
    });

    isConntectedRef.current = true;
  };

  /**
   * update socket messages function
   */
  const updateSocketMessages = () => {
    setAiMessages([]);
  };

  /**
   * listens to AI messages from the socket server
   * it updates the AI messages state with the new message
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("ai-message", (message: any) => {
      setAiMessages((prevMessages) => [
        {
          senderId: message.senderId,
          message: message.message,
          _id: message.chatId,
          createdAt: message.createdAt,
        },
        ...prevMessages,
      ]);
    });

    return () => {
      currentSocket.off("ai-message");
    };
  }, [socket]);

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("ai-loading", (data) => {
      if (data.isLoading) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      currentSocket.off("ai-loading");
    };
  }, [socket]);

  const value = {
    isConnected: isConntectedRef.current,
    aiMessages,
    joinAiRoom,
    sendAiMessage,
    updateSocketMessages,
    isTyping,
  };

  return (
    <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>
  );
};

export default AiChatContextProvider;
