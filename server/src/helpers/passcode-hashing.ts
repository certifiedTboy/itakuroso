import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * @class PasswordHashing
 * @description A class for hashing and verifying passwords.
 */
export class PasscodeHashing {
  /**
   * @method hashPassword
   * @description Hashes a plain password using node js crypto module.
   * @param {string} password - The plain password to hash.
   * @returns {Promise<string>} - A promise that resolves to the hashed password.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  /**
   * @method verifyPassword
   * @description Verifies a plain password against a hashed password using crypto module.
   * @param {string} plainPassword - The plain password to verify.
   * @param {string} storedPassword - The hashed password to compare against.
   * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
   */
  static async verifyPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');

    const buf = (await scryptAsync(plainPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
