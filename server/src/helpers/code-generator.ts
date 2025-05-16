/**
 * @class CodeGenerator
 * @description A utility class for generating one-time passwords (OTPs).
 * @method generateOtp Generates a random OTP of a specified length.
 * @returns {string} A string representation of the generated OTP.
 */
export class CodeGenerator {
  private static readonly OTP_LENGTH = 6;

  public static generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp.length === this.OTP_LENGTH ? otp : this.generateOtp();
  }
}
