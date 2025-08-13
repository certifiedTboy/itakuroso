import {
  deleteChatById,
  insertChat,
  markDbMessagesAsDelivered,
  markDbMessagesAsRead,
} from "@/helpers/database/chats";
import { updateRoomLastMessageId } from "@/helpers/database/contacts";
import { updateUserProfilePicture } from "@/helpers/database/user";
import NetInfo from "@react-native-community/netinfo";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useDeleteFileMutation } from "../apis/chat-apis";
import type { ChatContextType } from "./chat-context-types";
const API_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

export const ChatContext = createContext<ChatContextType>({
  messages: [
    {
      senderId: "",
      message: "",
      _id: "",
      createdAt: "",
      file: "",
      messageStatus: "",
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
  markMessagesAsRead: (
    roomId: string,
    currentUserId: { phoneNumber: string }
  ) => {},
  isTyping: false,
  handleDeleteChatById: async (chatId: string, roomId: string) => {},
  handleDeleteMessageForEveryone: (
    chatId: string,
    roomId: string,
    receiverId: string
  ) => {},
  triggerUserOfflineStatus: () => {},
  handleUpdateUserProfilePicture: async (
    phoneNumber: string,
    profilePicture: string,
    currentUserId: string
  ) => {},
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
      messageStatus: string;
      file?: string;
    }[]
  >([]);

  const [deleteFile] = useDeleteFileMutation();

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
   * mark messages as read function
   * @description This function emits an event to the server to mark messages as read
   * @param {string} roomId - The ID of the room where the messages are read.
   * @param {Object} currentUserId - The ID of the current user.
   */
  const markMessagesAsRead = (
    roomId: string,
    currentUserId: { phoneNumber: string }
  ) => {
    socket.current.emit("markMessagesAsRead", { roomId, currentUserId });
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
          messageStatus: message?.messageStatus,
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
            messageStatus: message?.messageStatus,
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
   * handles listening to the socket server emitting the markMessagesAsRead event
   * and updates the message status that belongs to a particular room
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on(
      "markMessagesAsRead",
      (data: { roomId: string; currentUserId: { phoneNumber: string } }) => {
        const { roomId } = data;

        (async () => {
          if (roomId) {
            await markDbMessagesAsRead(roomId);
          }
        })();
      }
    );

    return () => {
      currentSocket.off("markMessagesAsRead");
    };
  }, [socket]);

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("markMessagesAsDelivered", (data: { roomId: string }) => {
      const { roomId } = data;

      (async () => {
        if (roomId) {
          await markDbMessagesAsDelivered(roomId);
        }
      })();
    });

    return () => {
      currentSocket.off("markMessagesAsDelivered");
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

  const triggerUserOfflineStatus = () => {
    const currentSocket = socket.current;
    if (currentUser) {
      isConntectedRef.current = false;
      currentSocket.emit("userOffline", currentUser);
    }
  };

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
            file: message?.file,
            messageStatus: message.messageStatus,
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

  /**
   * @function handleDeleteChatById
   * Deletes a chat message by its ID.
   */
  const handleDeleteChatById = async (chatId: string, roomId: string) => {
    const chatToDeleteIndex = socketMessages.findIndex(
      (msg: any) => msg._id === chatId
    );

    /**
     * update the room last message, if the chat to be deleted is the last message in the room
     * this is to ensure that the room last message id is always up to date
     */
    if (chatToDeleteIndex !== -1) {
      if (chatToDeleteIndex === 0) {
        await updateRoomLastMessageId(
          socketMessages[chatToDeleteIndex + 1]._id,
          roomId
        );
      }

      /**
       * delete file from cloudinary if chat to delete has a file
       */
      if (socketMessages[chatToDeleteIndex].file) {
        const fileUrl = socketMessages[chatToDeleteIndex].file;
        const publicId = fileUrl
          .split("/")
          [fileUrl.split("/").length - 1].split(".")[0];

        await deleteFile(publicId);
      }

      /**
       * for fas UI update, we temporarily remove the chat to delete from the socket messages array
       * before deleting it from the database
       */
      setSocketMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages.splice(chatToDeleteIndex, 1);
        return updatedMessages;
      });

      /**
       * delete chat from the database
       * and update the last message id of the room
       */
      await deleteChatById(chatId);
    }
  };

  /**
   * handles deleting a message for everyone
   * it emits an event to the server to delete the message for everyone
   * and also deletes the chat from the database
   */
  const handleDeleteMessageForEveryone = (
    chatId: string,
    roomId: string,
    receiverId: string
  ) => {
    socket.current.emit("deleteMessageForEveryone", {
      chatId,
      roomId,
      receiverId,
    });

    (async () => {
      await handleDeleteChatById(chatId, roomId);
    })();
  };

  /**
   * handles deleting a message for the other user
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("deleteMessageForEveryone", ({ chatId, roomId }) => {
      (async () => {
        await handleDeleteChatById(chatId, roomId);
      })();
    });

    return () => {
      currentSocket.off("deleteMessageForEveryone");
    };
  }, [socket]);

  /**
   * @function handleUpdateUserProfilePicture
   * @param {string} phoneNumber - The phone number of the user.
   * @param {string} profilePicture - The new profile picture URL.
   */
  const handleUpdateUserProfilePicture = (
    phoneNumber: string,
    profilePicture: string,
    currentUserId: string
  ) => {
    socket.current.emit("updateUserProfilePicture", {
      phoneNumber,
      profilePicture,
      currentUserId,
    });
  };

  /**
   * update profile picture locally for other users on the network
   */
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on(
      "updateUserProfilePicture",
      ({ phoneNumber, profilePicture }) => {
        (async () => {
          await updateUserProfilePicture(phoneNumber, profilePicture);
        })();
      }
    );

    return () => {
      currentSocket.off("updateUserProfilePicture");
    };
  }, [socket]);

  const value = {
    messages: socketMessages,
    joinRoom,
    sendMessage,
    updateSocketMessages,
    markMessagesAsRead,
    isConnected: isConntectedRef.current,
    leaveRoom,
    triggerTypingIndicator,
    isTyping,
    handleDeleteChatById,
    handleDeleteMessageForEveryone,
    triggerUserOfflineStatus,
    handleUpdateUserProfilePicture,
  };

  // @ts-ignore
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
