import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { redis } from './redis';
import { getSessionBookedEmailTemplate } from '../template/sessionBook.template';
import { sendEmail } from './send.email';
import { NotificationService } from './notification.service';

@Injectable()
export class EmailWorkerService implements OnModuleInit {
     constructor(private readonly notificationService: NotificationService) { }
    private worker: Worker;

    onModuleInit() {
        console.log('📧 EmailWorkerService initializing...');

        this.worker = new Worker(
            'email-queue',
            async (job) => {
                const { toEmail, subject, session, userName, template } = job.data;

                if (!toEmail) throw new Error('Recipient email is missing');

                let html;
                switch (template) {
                    case 'SESSION_BOOKED':
                        html = getSessionBookedEmailTemplate(session, userName);
                        break;
                    default:
                        throw new Error('Unknown email template');
                }

                const ok = await this.notificationService.sendEmail(toEmail, subject, html );
                console.log('✅ Email sent successfully to',  ok);
            },
            {
                connection: {
                    // match BullMQ's expected ConnectionOptions
                    host: "thankful-man-23367.upstash.io",
                    port: 6379,
                    password: "AVtHAAIncDIzMzIxYjIyMmU0NGM0MTdiYmEzZTVjMjRhMzNiYWI4N3AyMjMzNjc",
                    tls: {} // required for rediss://
                },
                concurrency: 5,
            }
        );

        this.worker.on('completed', (job) => {
            console.log('📌 Email job completed:', job.id);
        });

        this.worker.on('failed', (job, err) => {
            console.error('❌ Email job failed:', job?.id, err.message);
        });
    }
}
