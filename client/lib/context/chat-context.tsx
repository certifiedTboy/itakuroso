import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

type ChatContextType = {
  messages: {
    senderId: string;
    message: string;
    _id: string;
    createdAt: string;
    type: string;
    file?: string;
    replyTo?: { replyToId: string; replyToMessage: string; senderId?: string };
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

  markMessageAsRead: (roomId: string) => void;
  trigerRoomRefetch: () => void;
  leaveRoom: (currentUserId: { phoneNumber: string }) => void;
  triggerCount: number;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [
    {
      senderId: "",
      message: "",
      _id: "",
      createdAt: "",
      type: "",
      file: "",
      replyTo: { replyToId: "", replyToMessage: "", senderId: "" },
    },
  ],
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

  markMessageAsRead: (roomId: string) => {},
  trigerRoomRefetch: () => {},
  leaveRoom: (currentUserId: { phoneNumber: string }) => {},
  triggerCount: 0,
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

  const [triggerCount, setTriggerCount] = useState(0);

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
  const sendMessage = async (messageData: {
    content: string;
    senderId: string;
    roomId?: string;
    file?: string;
    messageToReplyId?: string;
  }) => {
    socket.current.emit("message", messageData);
  };

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("message", (message: any) => {
      setTriggerCount((prevCount) => prevCount + 1);
      setSocketMessages((prevMessages) => [
        {
          senderId: message.senderId,
          message: message.message,
          _id: message._id,
          createdAt: message.createdAt,
          file: message?.file,
          type: "text",
          replyTo: {
            replyToId: message?.replyTo?.replyToId,
            replyToMessage: message?.replyTo?.replyToMessage,
            senderId: message?.replyTo?.senderId,
          },
        },
        ...prevMessages,
      ]);
    });

    return () => {
      currentSocket.off("message");
    };
  }, [socket]);

  const trigerRoomRefetch = () => {
    return true;
  };

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("markMessageAsRead", () => {
      setTriggerCount((prevCount) => prevCount + 1);
    });

    return () => {
      currentSocket.off("markMessageAsRead");
    };
  }, [socket]);

  // update socket messages function
  const updateSocketMessages = async (
    messages: [],
    currentUser: { phoneNumber: string; email: string }
  ) => {
    if (!messages || messages.length === 0) {
      return setSocketMessages([]);
    }
    return setSocketMessages(
      // @ts-ignore
      (prevMessges) => [
        ...prevMessges,
        ...messages?.map((message: any) => {
          return {
            senderId: message.senderId,
            isSender: message.senderId === currentUser?.phoneNumber,
            message: message.message,
            _id: message._id,
            createdAt: message.createdAt,
            type: "text",
            file: message?.file,
            replyTo: {
              replyToId: message?.replyTo?._id,
              replyToMessage: message?.replyTo?.message,
              senderId: message?.replyTo?.senderId,
            },
          };
        }),
      ]
    );
  };

  // mark message as read function
  const markMessageAsRead = (roomId: string) => {
    socket.current.emit("markMessageAsRead", {
      roomId: roomId,
    });
  };

  // leave room handler function
  const leaveRoom = (currentUserId: string) => {
    socket.current.emit("leaveRoom", {
      currentUserId,
    });
  };

  const value = {
    messages: socketMessages,
    joinRoom,
    sendMessage,
    updateSocketMessages,
    markMessageAsRead,
    trigerRoomRefetch,
    leaveRoom,
    triggerCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
