import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("contact_itakuroso_new");
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
 * Creates the contact table if it doesn't exist.
 * The table has fields for id, name, phoneNumber, and roomId.
 */
export const createContactTable = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync(`PRAGMA journal_mode = WAL`);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contact (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        roomId TEXT DEFAULT NULL,
        isActive BOOLEAN DEFAULT 0
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

/**
 * Retrieves all contacts from the contact table.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of contact objects.
 */
export const getContacts = async (): Promise<
  { id: string; name: string; phoneNumber: string }[]
> => {
  try {
    const db = await getDatabase();
    const results = await db.getAllAsync(`SELECT * FROM contact`);
    return results as { id: string; name: string; phoneNumber: string }[];
  } catch (error) {
    console.log("Error getting contacts:", error);
    return [];
  }
};
