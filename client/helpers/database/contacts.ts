import * as SQLite from "expo-sqlite";

export const createContactTable = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS contact (
      id VARCHAR PRIMARY KEY NOT NULL,
      name VARCHAR NOT NULL,
      phoneNumber VARCHAR NOT NULL
    );
  `);
    }
  } catch (error) {
    console.log(error);
  }
};

export const insertContacts = async (
  contacts: { id: string; name: string; phoneNumber: string }[]
) => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      for (const contact of contacts) {
        await db.runAsync(
          `INSERT OR REPLACE INTO contact (id, name, phoneNumber) VALUES (?, ?, ?)`,
          [contact.id, contact.name, contact.phoneNumber]
        );
      }
    }
  } catch (error) {
    console.log("Error inserting contacts:", error);
  }
};

export const getContacts = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("itakuroso_new");

    if (db) {
      const results = await db.getAllAsync(`SELECT * FROM contact`);

      return results;
    }
  } catch (error) {
    console.log(error);
  }
};
