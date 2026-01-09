import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        // user: process.env.MAIL_USER,
        // pass: process.env.MAIL_PASS,
        user: 'zuhairkhan5134@gmail.com',
        pass: 'tjsi alxt gbko xzfm',
    },
});

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        await transporter.sendMail({
            from: "zuhairkhan5134@gmail.com",
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Failed to send email', error);
        throw error; // IMPORTANT for BullMQ retry
    }
}
