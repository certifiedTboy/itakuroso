import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"MyApp" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to send email: ${error.message}`);
        throw error;
      }
    }
  }
}
