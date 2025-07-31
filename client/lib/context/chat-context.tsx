import { insertChat } from "@/helpers/database/chats";
import { updateRoomLastMessageId } from "@/helpers/database/contacts";
import NetInfo from "@react-native-community/netinfo";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
  aiMessages: {
    senderId: string;
    message: string;
    _id: string;
    createdAt: string;
  }[];
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
  ) => void;
  joinAiRoom: (
    roomId: string,
    currentUserData: { phoneNumber: string; email: string }
  ) => void;
  sendMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    roomId?: string;
    file?: string;
    replyTo?: {
      replyToId: string;
      replyToMessage: string;
      replyToSenderId: string;
    };
  }) => void;
  sendAiMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    roomId?: string;
  }) => void;
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
  aiMessages: [
    {
      senderId: "",
      message: "",
      _id: "",
      createdAt: "",
    },
  ],
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
  ) => {},
  joinAiRoom: (
    roomId: string,
    currentUserData: { phoneNumber: string; email: string }
  ) => {},
  sendMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    roomId?: string;
    file?: string;
    replyTo?: {
      replyToId: string;
      replyToMessage: string;
      replyToSenderId: string;
    };
  }) => {},
  sendAiMessage: (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    roomId?: string;
  }) => {},
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
  /**
   * chat message state data
   */
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

  const [aiMessages, setAiMessages] = useState<
    { senderId: string; message: string; _id: string; createdAt: string }[]
  >([]);

  /**
   * network info state data
   */
  const [networkInfo, setNetworkInfo] = useState<{
    type: string;
    isConnected: boolean;
  }>({ type: "", isConnected: false });

  const [triggerCount, setTriggerCount] = useState(0);

  const socket = useRef(io(API_URL));

  const { currentUser } = useSelector((state: any) => state.authState);

  useEffect(() => {
    const currentSocket = socket.current;
    currentSocket.on("connected", () => {
      if (currentUser) {
        currentSocket.emit("userOnline", currentUser);
      }
    });

    return () => {
      currentSocket.off("connected");
    };
  }, [socket, currentUser]);

  /**
   * network status state subscriber
   * it update if a user is connected or not
   * and also checks their method if internet connect
   * e.g wifi cellular
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkInfo({
        type: state.type,
        isConnected: state.isConnected! && state.isInternetReachable!,
      });

      NetInfo.fetch().then((state) => {
        setNetworkInfo({
          type: state.type,
          isConnected: state.isConnected! && state.isInternetReachable!,
        });
      });
    });

    return () => unsubscribe();
  }, []);

  /**
   * join room function
   */
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

  /**
   * send message function
   */
  const sendMessage = async (messageData: {
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    roomId?: string;
    file?: string;
    replyTo?: {
      replyToId: string;
      replyToMessage: string;
      replyToSenderId: string;
    };
  }) => {
    socket.current.emit("message", messageData);
  };

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
   * listens to incoming messages from the socket server
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("message", (message: any) => {
      setTriggerCount((prevCount) => prevCount + 1);
      setSocketMessages((prevMessages) => [
        {
          senderId: message.senderId,
          message: message.message,
          _id: message.chatId,
          createdAt: message.createdAt,
          file: message?.file,
          type: "text",
          replyTo: {
            replyToId: message?.replyTo?.replyToId,
            replyToMessage: message?.replyTo?.replyToMessage,
            replyToSenderId: message?.replyTo?.replyToId
              ? message?.replyTo?.replyToSenderId
              : undefined,
          },
        },
        ...prevMessages,
      ]);

      /**
       * a self invoking function to insert the chat message into the database
       */
      (async () => {
        if (message?.roomId) {
          await insertChat({
            chatId: message.chatId,
            senderId: message.senderId,
            message: message.message,
            chatRoomId: message.roomId,
            file: message?.file,
            replyToId: message?.replyTo?.replyToId,
          });

          await updateRoomLastMessageId(message.chatId, message?.roomId);
        }
      })();
    });

    return () => {
      currentSocket.off("message");
    };
  }, [socket]);

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

  /**
   * network status effect
   * helps update current user status if online or offline
   */
  useEffect(() => {
    const currentSocket = socket?.current;
    if (networkInfo && networkInfo.isConnected) {
      if (currentUser) {
        currentSocket.emit("userOnline", currentUser);
      }
    } else {
      if (currentUser) {
        currentSocket.emit("userOffline", currentUser);
      }
    }

    return () => {
      currentSocket.off("userOnline");
      currentSocket.off("userOffline");
    };
  }, [networkInfo.isConnected, networkInfo.type, currentUser, socket]);

  /**
   * an helpers function to help mark message as read
   */
  const trigerRoomRefetch = () => {
    return true;
  };

  /**
   * marks messages as read
   */
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
            createdAt: message.timestamp,
            type: "text",
            file: message?.file,
            replyTo: {
              replyToId: message?.repliedMessageId,
              replyToMessage: message?.repliedMessage,
              senderId: message?.repliedSenderId,
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
    aiMessages,
    joinAiRoom,
    sendAiMessage,
  };

  // @ts-ignore
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
