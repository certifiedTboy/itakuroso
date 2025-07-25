import { getDatabase } from "./database";

export const dropDatabase = async () => {
  const db = await getDatabase();
  if (db) {
    await db.execAsync(`DROP TABLE IF EXISTS contact`);
    await db.execAsync(`DROP TABLE IF EXISTS chatss`);
    // await db.execAsync(`DROP TABLE IF EXISTS room_idss`);
  }
};
