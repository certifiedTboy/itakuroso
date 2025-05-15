export class ResponseHandler {
  static ok(statusCode: number, message: string, data: object = {}) {
    return { statusCode, message, data };
  }
}
