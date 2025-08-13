import { getDatabase, runWithLock } from "./database";

/**
 * @function createChatTable
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
          FOREIGN KEY (replyToId) REFERENCES chatss(_id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_roomId ON chatss(roomId);
      `);
    }
  } catch (error) {
    console.log("error creating table", error);
  }
};

/**
 * @function insertChat
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
  messageStatus: string;
  file?: string;
  replyToId?: string;
}) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO chatss (_id, senderId, message, roomId, file, messageStatus, replyToId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            chatData.chatId,
            chatData.senderId,
            chatData.message,
            chatData.chatRoomId,
            chatData.file || null,
            chatData.messageStatus,
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
 * @function getChatsBySenderId
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
 * @function getLocalChatsByRoomId
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
        c.messageStatus,
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
 * @function getLastChatByRoomId
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

/**
 * @function deleteChatById
 * Deletes a chat message by its ID from the chats table.
 * @param {string} chatId - The ID of the chat message to delete.
 */
export const deleteChatById = async (chatId: string) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(`DELETE FROM chatss WHERE _id = ?`, [chatId]);
      }

      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error deleting chat:", error);
    }
  });
};

/**
 * @function markDbMessagesAsRead
 * Marks all messages in a specific room as read.
 * @param {string} roomId - The ID of the room for which to mark messages
 */
export const markDbMessagesAsRead = async (roomId: string) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(
          `UPDATE chatss SET messageStatus = 'read' WHERE roomId = ? AND messageStatus != 'read'`,
          [roomId]
        );
      }

      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error marking messages as read:", error);
    }
  });
};

/**
 * @function markDbMessagesAsDelivered
 * Marks all messages in a specific room as delivered.
 * @param {string} roomId - The ID of the room for which to mark messages
 */
export const markDbMessagesAsDelivered = async (roomId: string) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(
          `UPDATE chatss SET messageStatus = 'delivered' WHERE roomId = ? AND messageStatus != 'read'`,
          [roomId]
        );
      }

      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error marking messages as delivered:", error);
    }
  });
};

/**
 * @funtion updateChatMessageById
 * Updates a chat message by its ID in the chats table.
 * @param {string} chatId - The ID of the chat message to update.
 */
export const updateChatMessageById = async (
  chatId: string,
  updateMessage: string
) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");

      if (db) {
        await db.runAsync(`UPDATE chatss SET message = ? WHERE _id = ?`, [
          updateMessage,
          chatId,
        ]);
      }

      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error updating chat message:", error);
    }
  });
};
