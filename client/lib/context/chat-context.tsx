import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type ChatContextType = {
  messages: { senderId: string; message: string }[];
  joinRoom: (roomId: string, userId: string) => void;
  sendMessage: (message: string, senderId: string) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  joinRoom: (roomId: string, userId: string) => {},
  sendMessage: (
    // roomId: string,
    message: string,
    senderId: string
    // fileName?: string
  ) => {},
});

const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [socketMessages, setSocketMessages] = useState<
    {
      senderId: string;
      message: string;
    }[]
  >([]);

  const API_URL = "https://cd7b-102-88-111-247.ngrok-free.app";

  const socket = useRef(io(API_URL));

  //   const updateSocketMessages = (messages?: any, messageId?: string) => {
  //     if (messageId) return setSocketMessages([]);
  //     if (messages && messages.length > 0) {
  //       const sortedItems = sortChatMessagesByTime(messages);

  //       sortedItems.slice(1).forEach((message: any) => {
  //         setSocketMessages((prevMessages) => [
  //           ...prevMessages,
  //           {
  //             senderId: message.sender.id,
  //             message: message.message,
  //             created_at: message.created_at,
  //             serverFile: message?.message_attachment?.attachment,
  //             file: null,
  //           },
  //         ]);
  //       });
  //     }
  //   };

  // join room function
  const joinRoom = (roomId: string, userId: string) => {
    socket?.current.emit("joinRoom", {
      roomId,
      userId,
    });
  };

  // send message function
  const sendMessage = (
    // roomId: string,
    message: string,
    senderId: string
    // fileName?: string
  ) => {
    socket.current.emit("sendMessage", {
      //   roomId,
      message,
      senderId,
      //   fileName,
    });
  };

  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("newMessage", (message: any) => {
      console.log(message);
      //   setSocketMessages((prevMessages) => [
      //     ...prevMessages,
      //     {
      //       senderId: message.senderId,
      //       message: message.message,
      //       created_at: message?.messageSaved[0]?.created_at,
      //       file: message?.reConstructBase64,
      //       serverFile: message?.messageSaved[1]?.attachment,
      //     },
      //   ]);
    });

    return () => {
      currentSocket.off("newMessage");
    };
  }, [socket]);

  const value = {
    messages: socketMessages,
    joinRoom,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
