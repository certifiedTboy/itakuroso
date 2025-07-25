import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("itakuroso_db");
    await dbInstance.execAsync(`PRAGMA journal_mode = WAL`);
    await dbInstance.execAsync(`PRAGMA foreign_keys = ON`);
  }
  return dbInstance;
};

export const runWithLock = async (fn: () => Promise<void>) => {
  let dbLock = false;
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
