import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly Oauth2Client: OAuth2Client;
  private readonly user: string;

  constructor(private configService: ConfigService) {
    const refreshToken = this.configService.get<string>('EMAIL_REFRESH_TOKEN')!;
    const accessToken = this.configService.get<string>('EMAIL_ACCESS_TOKEN')!;
    const clientId = this.configService.get<string>('EMAIL_CLIENT_ID')!;
    const clientSecret = this.configService.get<string>('EMAIL_CLIENT_SECRET')!;
    const redirectUri = this.configService.get<string>('EMAIL_REDIRECT_URI')!;
    this.user = this.configService.get<string>('EMAIL_USER')!;
    const host = this.configService.get<string>('EMAIL_SMTP_HOST')!;

    this.Oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    this.Oauth2Client.setCredentials({ refresh_token: refreshToken });

    this.transporter = nodemailer.createTransport({
      service: host,
      auth: {
        type: 'OAuth2',
        user: this.user,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });
  }

  async sendMail(to: string, subject: string, message: string) {
    try {
      await this.transporter.sendMail({
        from: this.user,
        to,
        subject,
        html: `<h1> ${message} </h1>`,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  }
}
