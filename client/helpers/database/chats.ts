import * as SQLite from "expo-sqlite";
import { generateChatId } from "../chat-helpers";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("itakuroso_new");
    await dbInstance.execAsync(`PRAGMA journal_mode = WAL`);
  }
  return dbInstance;
};

let dbLock = false;
const runWithLock = async (fn: () => Promise<void>) => {
  while (dbLock) {
    await new Promise((res) => setTimeout(res, 50));
  }
  dbLock = true;
  try {
    await fn();
  } finally {
    dbLock = false;
  }
};

/**
 * @method createChatTable
 * Creates the chats table in the SQLite database if it does not already exist.
 */
export const createChatTable = async () => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();

      if (db) {
        await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS chats (
          _id TEXT PRIMARY KEY NOT NULL,
          senderId TEXT NOT NULL,
          message TEXT NOT NULL,
          roomId TEXT NOT NULL,
          file TEXT DEFAULT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_roomId ON chats(roomId);
      `);
      }
    } catch (error) {
      console.log(error);
    }
  });
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
export const insertChat = async (
  chatData: {
    senderId: string;
    message: string;
    chatRoomId: string;
    file?: string;
  }[]
) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        for (const chat of chatData) {
          const chatId = generateChatId();
          await db.runAsync(
            `INSERT OR REPLACE INTO chats (_id, senderId, message, roomId, file) VALUES (?, ?, ?, ?, ?)`,
            [
              chatId,
              chat.senderId,
              chat.message,
              chat.chatRoomId,
              chat.file || null,
            ]
          );
        }
      }

      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error inserting contacts:", error);
    }
  });
};

/**
 * @method getChatsBySenderId
 * Retrieves all chat messages sent by a specific sender from the chats table.
 * @param {string} senderId - The ID of the sender for which to retrieve chat messages.
 */
export const getChatsBySenderId = async (senderId: string) => {
  try {
    const db = await getDatabase();

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
 * @method getLocalChatsByRoomId
 * Retrieves all chat messages associated with a specific room ID from the chats table.
 * @param {string} roomId - The ID of the room for which to retrieve chat messages.
 */
export const getLocalChatsByRoomId = async (roomId: string) => {
  try {
    const db = await getDatabase();

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
    const db = await getDatabase();

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
