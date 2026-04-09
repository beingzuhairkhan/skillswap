import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, // Gmail address
      pass: process.env.MAIL_PASS, // App password!
    },
  });

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        html,
      });
      console.log('✅ Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error; // Important: rethrow for BullMQ retries
    }
  }
}