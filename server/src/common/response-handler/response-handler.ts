export interface ResponseHandlerInterface {
  statusCode: number;
  message: string;
  data?: object;
}

export class ResponseHandler {
  static ok(statusCode: number, message: string, data: object = {}) {
    const response: ResponseHandlerInterface = { statusCode, message, data };

    return response;
  }
}
