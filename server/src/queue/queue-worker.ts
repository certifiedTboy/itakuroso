import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '../common/mailer/mailer.service';
import { FileUploadService } from '../common/file-upload/file-upload-service';
import { Multer } from 'multer';

@Processor('appQueue', { concurrency: 3 }) // Can run up to 3 jobs concurrently
export class QueueWorker extends WorkerHost {
  constructor(
    private readonly mailerService: MailerService,
    private readonly fileUploadService: FileUploadService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'email':
        await this.mailerService.sendMail(
          job.data.email!,
          job.data.subject!,
          `Your verification code is: ${job.data.verificationCode}`,
        );

        break;
      case 'file-upload': {
        const result = await this.fileUploadService.uploadFileToCloud(
          job.data?.buffer,
        );

        console.log(result);

        break;
      }

      default:
        console.log(`Unknown job name: ${job.name}`);
        break;
    }
  }
}
