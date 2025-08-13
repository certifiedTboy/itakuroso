import moment from "moment";
import { getRoomId, insertRoomId } from "./database/room";

/**
 * Generates a random room ID for the chat.
 * @returns {string} A random string representing the room ID.
 */
export const generateRoomId = async (phoneNumber: string): Promise<string> => {
  const existingRoomId = await getRoomId(phoneNumber);

  if (existingRoomId && existingRoomId.roomId) {
    return existingRoomId.roomId;
  }
  const randomId = Math.random().toString(36).substring(2, 15);
  await insertRoomId({ phoneNumber, id: generateDbId(), roomId: randomId });
  return randomId;
};

/**
 * @method generateChatId
 * Generates a random chat ID for the chat.
 */
export const generateDbId = () => {
  const chatId = Math.random().toString(36).substring(2, 15);
  return chatId;
};

/**
 * @function formatDate
 * Formats a date to a more readable string.
 * @param {string} date - The date to format.
 */
export const formatDate = (date: string) => {
  return moment.utc(date, "YYYY-MM-DD HH:mm:ss").local().fromNow();
};

/**
 * @function removeAsteriks
 * Removes asterisks from a message string.
 */
export const removeAsteriks = (message: string) => {
  return message.replace(/\*/g, "");
};
