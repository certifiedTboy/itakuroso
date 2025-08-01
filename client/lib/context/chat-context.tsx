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
  joinRoom: (
    userId: { contactName: string; phoneNumber: string },
    currentUser: { phoneNumber: string; email: string },
    roomId?: string
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
  updateSocketMessages: (
    messages: [],
    currentUser?: { phoneNumber: string; email: string }
  ) => void;
  leaveRoom: (currentUserId: { phoneNumber: string }) => void;
  triggerTypingIndicator: (roomId: string) => void;
  isTyping?: boolean;
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
  updateSocketMessages: (
    messages: [],
    currentUser?: { phoneNumber: string; email: string }
  ) => {},

  leaveRoom: (currentUserId: { phoneNumber: string }) => {},
  triggerTypingIndicator: (roomId: string) => {},
  isTyping: false,
});

const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef(io(API_URL));
  const isConntectedRef = useRef(false);
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

  const [isTyping, setIsTyping] = useState(false);

  /**
   * network info state data
   */
  const [networkInfo, setNetworkInfo] = useState<{
    type: string;
    isConnected: boolean;
  }>({ type: "", isConnected: false });

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
   * trigger typing indicator function
   */
  const triggerTypingIndicator = (roomId: string) => {
    socket.current.emit("userTyping", {
      roomId,
    });
  };

  /**
   * listens to typing indicator from the socket server
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("userTyping", () => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    });

    return () => {
      currentSocket.off("userTyping");
    };
  }, [socket]);

  /**
   * listens to incoming messages from the socket server
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("message", (message: any) => {
      // setTriggerCount((prevCount) => prevCount + 1);
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
        isConntectedRef.current = false;
        currentSocket.emit("userOffline", currentUser);
      }
    }

    return () => {
      currentSocket.off("userOnline");
      currentSocket.off("userOffline");
    };
  }, [networkInfo.isConnected, networkInfo.type, currentUser, socket]);

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
    // markMessageAsRead,
    isConnected: isConntectedRef.current,
    leaveRoom,
    triggerTypingIndicator,
    isTyping,
  };

  // @ts-ignore
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
