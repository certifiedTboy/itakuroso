/**
 * Generates a random room ID for the chat.
 * @returns {string} A random string representing the room ID.
 */
export const generateRoomId = () => {
  const randomId = Math.random().toString(36).substring(2, 15);
  return randomId;
};
