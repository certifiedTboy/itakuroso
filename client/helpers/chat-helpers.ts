/**
 * Generates a random room ID for the chat.
 * @returns {string} A random string representing the room ID.
 */
export const generateRoomId = () => {
  const randomId = Math.random().toString(36).substring(2, 15);
  return randomId;
};

/**
 * @method generateChatId
 * Generates a random chat ID for the chat.
 */
export const generateChatId = () => {
  const chatId = Math.random().toString(36).substring(2, 15);
  return chatId;
};
