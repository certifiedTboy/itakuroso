import { getDatabase } from "./database";

/**
 * Creates the user profile table if it doesn't exist.
 * The table has fields for id, phoneNumber, and roomId.
 */
export const createUserProfileTable = async () => {
  try {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        phoneNumber TEXT NOT NULL,
        isOnline BOOLEAN DEFAULT 0,
        lastSeen TIMESTAMP,
        isActive BOOLEAN DEFAULT 0,
        profilePicture TEXT DEFAULT NULL
      );
    `);
  } catch (error) {
    console.log("Error creating table:", error);
  }
};

/**
 * Inserts or updates a user profile in the user_profile table.
 */
export const upsertUserProfile = async (userProfile: {
  id: string;
  phoneNumber: string;
  isOnline: boolean;
  lastSeen: Date;
  isActive: boolean;
  profilePicture: string;
}) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `
      INSERT INTO user_profile (id, phoneNumber, isOnline, lastSeen, isActive, profilePicture)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        phoneNumber = excluded.phoneNumber,
        isOnline = excluded.isOnline,
        lastSeen = excluded.lastSeen,
        isActive = excluded.isActive,
        profilePicture = excluded.profilePicture
    `,
      [
        userProfile.id,
        userProfile.phoneNumber,
        userProfile.isOnline,
        userProfile.lastSeen.toString(),
        userProfile.isActive,
        userProfile.profilePicture,
      ]
    );
  } catch (error) {
    console.log("Error upserting user profile:", error);
  }
};

/**
 * Gets a user profile by ID.
 */
export const getUserProfileById = async (phoneNumber: string) => {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync(
      `
      SELECT * FROM user_profile WHERE phoneNumber = ?
    `,
      [phoneNumber]
    );
    return row as {
      id: string;
      phoneNumber: string;
      isOnline: boolean;
      lastSeen: Date;
      isActive: boolean;
      profilePicture: string;
    };
  } catch (error) {
    console.log("Error getting user profile:", error);
  }
};

/**
 * update user profile picture
 * @param phoneNumber - The phone number of the user
 * @param profilePicture - The new profile picture URL
 */
export const updateUserProfilePicture = async (
  phoneNumber: string,
  profilePicture: string
) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `
      UPDATE user_profile SET profilePicture = ? WHERE phoneNumber = ?
    `,
      [profilePicture, phoneNumber]
    );
  } catch (error) {
    console.log("Error updating user profile picture:", error);
  }
};
