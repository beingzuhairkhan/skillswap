import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';



@Injectable()
export class NotificationService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            //   user: process.env.MAIL_USER,
            //   pass: process.env.MAIL_PASS,
            user: 'zuhairk7890o@gmail.com',
            pass: 'vyvc hrzb iwxl kghv',
        },
    });

    async sendEmail(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: 'zuhairk7890o@gmail.com',
                to,
                subject,
                html
            })
        } catch (error) {
        console.log("failed to send mail " , error)
        }
    }





}
