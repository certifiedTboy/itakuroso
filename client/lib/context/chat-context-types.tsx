/**
 * type definition for the ChatContext
 * @description This type defines the structure of the ChatContext
 */
export type ChatContextType = {
  messages: {
    senderId: string;
    message: string;
    _id: string;
    createdAt: string;
    file?: string;
    messageStatus: string;
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
  markMessagesAsRead: (
    roomId: string,
    currentUserId: { phoneNumber: string }
  ) => void;

  isTyping?: boolean;
  handleDeleteChatById: (chatId: string, roomId: string) => Promise<void>;
  handleDeleteMessageForEveryone: (
    chatId: string,
    roomId: string,
    receiverId: string
  ) => void;
};

export type AiChatContextType = {
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
