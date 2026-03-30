import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { getSessionBookedEmailTemplate } from '../template/sessionBook.template';
import { NotificationService } from './notification.service';
import { getForgotPasswordEmailTemplate } from 'src/template/forgotPassword.template';

@Injectable()
export class EmailWorkerService implements OnModuleInit {
  constructor(private readonly notificationService: NotificationService) {}
  private worker!: Worker;

  onModuleInit() {
    console.log(' EmailWorkerService initializing...');

    this.worker = new Worker(
      'email-queue',
      async (job) => {
        try {
          const { toEmail, subject, session, userName, template, OTP } = job.data;
          console.log("jon" , job.data)

          if (!toEmail) throw new Error('Recipient email is missing');

          console.log(` Processing email job ${job.id} for ${toEmail} | Template: ${template}`);

          let html;
          switch (template) {
            case 'SESSION_BOOKED':
              html = getSessionBookedEmailTemplate(session, userName);
              break;
            case 'FORGOT_PASSWORD':
              if (!OTP) throw new Error('OTP is missing');
              html = getForgotPasswordEmailTemplate(OTP);
              break;
            default:
              throw new Error('Unknown email template');
          }

          // Wrap sendEmail in try/catch to catch provider errors
          try {
            const result = await this.notificationService.sendEmail(toEmail, subject, html);
            console.log(' Email sent successfully to', toEmail, '| Result:', result);
          } catch (sendErr) {
            console.error(' Failed to send email to', toEmail, '| Error:', sendErr);
            throw sendErr; // Let BullMQ retry if needed
          }
        } catch (err) {
          console.error(' Email job processing failed for job', job.id, '| Error:', err);
          throw err; // Let BullMQ mark job as failed
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          tls: {},
        },
        concurrency: 5,
      },
    );

    this.worker.on('completed', (job) => {
      console.log(' Email job completed:', job.id);
    });

    this.worker.on('failed', (job, err) => {
      console.error(' Email job failed:', job?.id, '| Error:', err?.message || err);
    });
  }
}