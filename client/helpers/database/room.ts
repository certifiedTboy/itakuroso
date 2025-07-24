import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

interface IRoomId {
  id: string;
  phoneNumber: string;
  roomId: string;
}

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("itakuroso_db");
    await dbInstance.execAsync(`PRAGMA journal_mode = WAL`);
    // await dbInstance.execAsync(`PRAGMA foreign_keys = ON`);
  }
  return dbInstance;
};

/**
 * Creates the room_ids table if it doesn't exist.
 * The table has fields for id, phoneNumber, and roomId.
 */
export const createRoomIdTable = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS room_idss (
        id TEXT PRIMARY KEY NOT NULL,
        phoneNumber TEXT NOT NULL,
        roomId TEXT DEFAULT NULL
      );
    `);
  } catch (error) {
    console.log("Error creating table:", error);
  }
};

/**
 * Inserts contacts into the contact table.
 * If a contact with the same id already exists, it will be replaced.
 * @param {IRoomId} roomIdData - The room ID data to insert.
 */
export const insertRoomId = async (roomIdData: IRoomId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO room_idss (id, phoneNumber, roomId) VALUES (?, ?, ?)`,
      [roomIdData.id, roomIdData.phoneNumber, roomIdData.roomId]
    );
  } catch (error) {
    console.log("Error inserting roomId:", error);
  }
};

/**
 * Retrieves all contacts from the contact table.
 * @returns {Promise<IRoomId>}
 */
export const getRoomId = async (phoneNumber: string): Promise<IRoomId> => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT phoneNumber, roomId FROM room_idss WHERE phoneNumber = ?`,
      [phoneNumber]
    );

    return (result && result.length > 0 ? result[0] : null) as IRoomId;
  } catch (error) {
    console.error("Error getting roomId:", error);
    throw error; // Re-throw or return [] based on your error handling strategy
  }
};
