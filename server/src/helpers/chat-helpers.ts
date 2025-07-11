export class ChatHelpers {
  static formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  static messageResponse(
    message: string,
    senderId: string,
    _id?: string,
    file?: string,
    replyTo?: {
      replyToId: string;
      replyToMessage: string;
    },
  ): any {
    return {
      message,
      senderId,
      _id,
      file: file || null,
      createdAt: new Date(),
      replyTo: replyTo,
    };
  }

  static generateChatId() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `chat_${randomId}`;
  }

  static generateRoomId() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `room_${randomId}`;
  }

  static getPaginationParams(page: string) {
    const pageNumber = parseInt(page);

    const skip = (pageNumber - 1) * 10;

    return { limit: 15, skip };
  }
}
