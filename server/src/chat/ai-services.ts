import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

/**
 * @class AiServices
 * @description Manages all ai-related operations.
 * This includes creating users, verifying them, and finding users by their ID or verification code.
 */
@Injectable()
export class AiServices {
  private googleGenAi: GoogleGenAI;
  ai_api_key: string;
  constructor(private readonly configService: ConfigService) {
    const ai_api_key = this.configService.get<string>('AI_API_KEY');

    this.googleGenAi = new GoogleGenAI({
      apiKey: ai_api_key,
    });
  }

  /**
   * @method runConveration
   * @description Runs a conversation with the AI model using the provided message.
   * @param {string} message - The message to send to the AI model.
   */
  async runConveration(message: string) {
    try {
      const response = await this.googleGenAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
      });

      if (!response || !response?.text) {
        throw new Error('Something went wrong while processing your request.');
      }

      return { result: response.text };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: 'Something went wrong while processing your request.' };
      } else {
        return { error: 'An unexpected error occurred.' };
      }
    }
  }
}
