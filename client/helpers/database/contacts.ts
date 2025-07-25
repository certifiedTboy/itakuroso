import { getDatabase, runWithLock } from "./database";

/**
 * Creates the contact table if it doesn't exist.
 * The table has fields for id, name, phoneNumber, and roomId.
 */
export const createContactTable = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contact (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        roomId TEXT DEFAULT NULL,
        isActive BOOLEAN DEFAULT 0,
        lastMessageId TEXT DEFAULT NULL,
        FOREIGN KEY (lastMessageId) REFERENCES chatss(_id)
      );
    `);
  } catch (error) {
    console.log("Error creating table:", error);
  }
};

/**
 * Inserts contacts into the contact table.
 * If a contact with the same id already exists, it will be replaced.
 * @param {Array} contacts - Array of contact objects to insert.
 */
export const insertContacts = async (
  contacts: {
    id: string;
    name: string;
    phoneNumber: string;
    roomId?: string;
    isActive?: boolean;
  }[]
) => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.runAsync("BEGIN TRANSACTION");
      for (const contact of contacts) {
        await db.runAsync(
          `INSERT OR REPLACE INTO contact (id, name, phoneNumber, roomId) VALUES (?, ?, ?, ?)`,
          [
            contact.id,
            contact.name,
            contact.phoneNumber,
            contact.roomId || null,
          ]
        );
      }
      await db.runAsync("COMMIT");
    } catch (error) {
      console.log("Error inserting contacts:", error);
    }
  });
};

interface IContact {
  id: string;
  name: string;
  phoneNumber: string;
  roomId?: string;
}

/**
 * Retrieves all contacts from the contact table.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of contact objects.
 */
export const getContacts = async (): Promise<IContact[]> => {
  try {
    const db = await getDatabase();
    const results = await db.getAllAsync(`
      SELECT 
        c.id,
        c.name,
        c.phoneNumber, 
        c.isActive, 
        c.roomId, 
        c.lastMessageId,
        r._id as lastMessageId,
        r.senderId as lastMessageSenderId,
        r.message as lastMessageContent,
        r.timestamp as lastMessageTimestamp,
        r.file as lastMessageFile,
        r.replyToId as lastMessageReplyToId
      FROM contact c
      LEFT JOIN chatss r ON c.lastMessageId = r._id
    `);

    return results as IContact[];
  } catch (error) {
    console.error("Error getting contacts:", error);
    throw error; // Re-throw or return [] based on your error handling strategy
  }
};

/**
 * @function updateRoomLastMessageId
 * @param {string} lastMessageId - Id of the last message to update
 * @param {string} roomId - The ID of the room to associate with the last message.
 * @returns {Promise<void>}
 */
export const updateRoomLastMessageId = async (
  lastMessageId: string,
  roomId: string
): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(`UPDATE contact SET lastMessageId = ? WHERE roomId = ?`, [
      lastMessageId,
      roomId,
    ]);
  } catch (error) {
    console.error("Error updating room last message ID:", error);
  }
};

/**
 * Retrieves all contacts from the contact table.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of contact objects.
 */
export const getContactsWithRoomIds = async (): Promise<IContact[]> => {
  try {
    const db = await getDatabase();

    const results = await db.getAllAsync(`
      SELECT 
        c.id,
        c.name,
        c.phoneNumber, 
        c.isActive, 
        c.roomId, 
        c.lastMessageId,
        r._id as lastMessageId,
        r.senderId as lastMessageSenderId,
        r.message as lastMessageContent,
        r.timestamp as lastMessageTimestamp,
        r.file as lastMessageFile,
        r.replyToId as lastMessageReplyToId
      FROM contact c
      LEFT JOIN chatss r ON c.lastMessageId = r._id
    `);

    return results.filter(
      (contact: any) => contact.roomId !== null
    ) as IContact[];
  } catch (error) {
    console.log("Error getting contacts:", error);
    return [];
  }
};
