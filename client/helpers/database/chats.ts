import { getDatabase, runWithLock } from "./database";

/**
 * @method createChatTable
 * Creates the chats table in the SQLite database if it does not already exist.
 */
export const createChatTable = async () => {
  try {
    const db = await getDatabase();

    if (db) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS chatss (
          _id TEXT PRIMARY KEY NOT NULL,
          senderId TEXT NOT NULL,
          message TEXT NOT NULL,
          roomId TEXT NOT NULL,
          file TEXT DEFAULT NULL,
          messageStatus TEXT DEFAULT 'sent',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          replyToId TEXT DEFAULT NULL,
          FOREIGN KEY (replyToId) REFERENCES chatss(_id)
        );
        CREATE INDEX IF NOT EXISTS idx_roomId ON chatss(roomId);
      `);
    }
  } catch (error) {
    console.log("error creating table", error);
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
  chatId: string;
  senderId: string;
  message: string;
  chatRoomId: string;
  file?: string;
  replyToId?: string;
}) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO chatss (_id, senderId, message, roomId, file, replyToId) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            chatData.chatId,
            chatData.senderId,
            chatData.message,
            chatData.chatRoomId,
            chatData.file || null,
            chatData.replyToId || null,
          ]
        );
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
        `SELECT * FROM chatss WHERE senderId = ?`,
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
        `
      SELECT 
        c._id,
        c.senderId,
        c.message,
        c.file,
        c.roomId,
        c.timestamp,
        c.replyToId,

        -- Replied message fields (from self-join)
        r._id AS repliedMessageId,
        r.senderId AS repliedSenderId,
        r.message AS repliedMessage,
        r.file AS repliedFile,
        r.timestamp AS repliedTimestamp

      FROM chatss c
      LEFT JOIN chatss r ON c.replyToId = r._id
      WHERE c.roomId = ?
      ORDER BY c.timestamp DESC
  `,
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
        `SELECT * FROM chatss WHERE roomId = ? ORDER BY timestamp DESC LIMIT 1`,
        [roomId]
      );

      return results;
    }
  } catch (error) {
    console.log(error);
  }
};
