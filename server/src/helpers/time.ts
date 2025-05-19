/**
 * @class Time
 * @description A class to handle time-related operations.
 * This includes checking if a given time is expired and getting the time in one hour.
 */
export class Time {
  /**
   * @method getTimeInOneHour
   * @description Returns the current time plus one hour.
   * @returns {Date} - The current time plus one hour.
   */
  static getTimeInOneHour() {
    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
    return oneHourLater;
  }

  /**
   * @method checkIfTimeIsExpired
   * @description Checks if the given time is expired.
   * @param {Date} time - The time to check.
   * @returns {boolean} - True if the time has exceed one hour from when it was generated, false otherwise.
   */
  static checkIfTimeIsExpired(time: Date): boolean {
    const currentTime = new Date();
    const timeInOneHour = new Date(time.getTime() + 60 * 60 * 1000);
    return currentTime > timeInOneHour;
  }
}
