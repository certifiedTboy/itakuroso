import moment from "moment";

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

/**
 * @function formatDate
 * Formats a date to a more readable string.
 * @param {string} date - The date to format.
 */
export const formatDate = (date: string) => {
  // const currentDate = new Date();

  // const year = new Date(date).getFullYear();
  // const month = new Date(date).getMonth(); // Months are zero-indexed
  // const day = new Date(date).getDate();
  // // return [year, month, day];

  // const currentYear = currentDate.getFullYear();
  // const currentMonth = currentDate.getMonth();
  // const currentDay = currentDate.getDate();

  // const a = moment([year, month, day]);
  // const b = moment([currentYear, currentMonth, currentDay]);

  return moment(date).fromNow();
};
