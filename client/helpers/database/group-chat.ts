import { getDatabase, runWithLock } from "./database";

/**
 * Types
 */
export interface GroupChat {
  id: string;
  groupName: string;
  groupImage: string | null;
  members: string[]; // parsed JSON array
  roomLink: string | null;
  roomId: string;
}

export interface GroupChatRow {
  id: string;
  roomName: string | null;
  roomImage: string | null;
  members: string | null; // JSON string in DB
  roomLink: string | null;
  roomId: string;
}

/**
 * Create the group_chats table if it doesn't exist.
 */
export const createGroupChatTable = async (): Promise<void> => {
  await runWithLock(async () => {
    try {
      const db = await getDatabase();
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS group_chatss (
        id TEXT PRIMARY KEY NOT NULL,
        roomName TEXT,
        roomImage TEXT,
        members TEXT,       -- JSON array string
        roomLink TEXT,
        roomId TEXT,
        lastMessageId TEXT DEFAULT NULL,
        FOREIGN KEY (lastMessageId) REFERENCES chatss(_id) ON DELETE CASCADE
      );
    `);
    } catch (error) {
      console.log("❌ Error creating group chat table:", error);
    }
  });
};

/**
 * Insert or replace a group chat
 */
export const insertGroupChat = async (
  groupChatData: GroupChat
): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO group_chatss 
        (id, roomName, roomImage, members, roomLink, roomId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        groupChatData.id,
        groupChatData.groupName,
        groupChatData.groupImage,
        JSON.stringify(groupChatData.members ?? []),
        groupChatData.roomLink ?? null,
        groupChatData.roomId,
      ]
    );
  } catch (error) {
    console.error("❌ Error inserting group chat:", error);
    throw error;
  }
};

/**
 * Fetch all group chats
 */
export const fetchGroupChats = async (): Promise<GroupChat[]> => {
  try {
    const db = await getDatabase();
    const rows: GroupChatRow[] = await db.getAllAsync(
      `SELECT * FROM group_chatss`
    );

    return rows.map((row) => {
      let members: string[] = [];
      try {
        members = row.members ? JSON.parse(row.members) : [];
      } catch (e) {
        console.warn("⚠️ Invalid members JSON for chat:", row.id, row.members);
      }
      return {
        id: row.id,
        groupName: row.roomName ?? "",
        groupImage: row.roomImage,
        members,
        roomLink: row.roomLink,
        roomId: row.roomId,
      };
    });
  } catch (error) {
    console.error("❌ Error fetching group chats:", error);
    throw error;
  }
};

/**
 * Delete a group chat by ID
 */
export const deleteGroupChat = async (id: string): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM group_chatss WHERE id = ?`, [id]);
    console.log("🗑️ Group chat deleted:", id);
  } catch (error) {
    console.error("❌ Error deleting group chat:", error);
    throw error;
  }
};

/**
 * Get a specific group chat by its room ID.
 */
export const getGroupChat = async (roomId: string) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM group_chatss WHERE roomId = ?`,
      [roomId]
    );
    return result;
  } catch (error) {
    console.error("Error getting group chat:", error);
    throw error;
  }
};

/**
 * Get all group chats.
 */
export const getGroupChats = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(`SELECT * FROM group_chatss`);
    return result;
  } catch (error) {
    console.error("Error getting group chats:", error);
    throw error;
  }
};
