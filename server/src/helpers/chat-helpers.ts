export class ChatHelpers {
  static formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  static messageResponse(
    message: string,
    senderId: string,
    _id?: string,
    file?: string,
  ): any {
    return {
      message,
      senderId,
      _id,
      file: file || null,
      createdAt: new Date(),
    };
  }

  static generateChatId() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `chat_${randomId}`;
  }
}
