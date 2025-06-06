import * as SQLite from "expo-sqlite";
import { generateChatId } from "../chat-helpers";

/**
 * @method createChatTable
 * Creates the chats table in the SQLite database if it does not already exist.
 */
export const createChatTable = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");
    if (db) {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS chats (
          id VARCHAR PRIMARY KEY NOT NULL,
          senderId VARCHAR NOT NULL,
          currentUserId VARCHAR NOT NULL,
          message TEXT NOT NULL,
          roomId VARCHAR NOT NULL,
           file VARCHAR DEFAULT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * @method insertChat
 * Inserts a new chat message into the chats table.
 * @param {Object} chatData - The data for the chat message to be inserted.
 * @param {string} chatData.senderId - The ID of the sender of the message.
 * @param {string} chatData.currentUserId - The ID of the current user.
 * @param {string} chatData.message - The content of the chat message.
 * @param {string} chatData.roomId - The ID of the room where the message is sent.
 */
export const insertChat = async (chatData: {
  senderId: string;
  currentUserId: string;
  message: string;
  roomId: string;
}) => {
  const chatId = generateChatId();
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      await db.runAsync(
        `INSERT OR REPLACE INTO chats (id, senderId, currentUserId, message, roomId) VALUES (?, ?, ?, ?, ?)`,
        [
          chatId,
          chatData.senderId,
          chatData.currentUserId,
          chatData.message,
          chatData.roomId,
        ]
      );
    }
  } catch (error) {
    console.log("Error inserting contacts:", error);
  }
};

/**
 * @method getChatsBySenderId
 * Retrieves all chat messages sent by a specific sender from the chats table.
 * @param {string} senderId - The ID of the sender for which to retrieve chat messages.
 */
export const getChatsBySenderId = async (senderId: string) => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      const results = await db.getAllAsync(
        `SELECT * FROM chats WHERE senderId = ?`,
        [senderId]
      );

      return results;
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * @method getChatsByRoomId
 * Retrieves all chat messages associated with a specific room ID from the chats table.
 * @param {string} roomId - The ID of the room for which to retrieve chat messages.
 */
export const getChatsByRoomId = async (roomId: string) => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      const results = await db.getAllAsync(
        `SELECT * FROM chats WHERE roomId = ?`,
        [roomId]
      );

      return results;
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * @method getLastChatByRoomId
 * Retrieves the last chat message associated with a specific room ID from the chats table.
 * @param {string} roomId - The ID of the room for which to retrieve the last chat message.
 */

export const getLastChatByRoomId = async (roomId: string) => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      const results = await db.getAllAsync(
        `SELECT * FROM chats WHERE roomId = ? ORDER BY timestamp DESC LIMIT 1`,
        [roomId]
      );

      return results;
    }
  } catch (error) {
    console.log(error);
  }
};
