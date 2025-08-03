import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '../common/mailer/mailer.service';
import { FileUploadService } from '../common/file-upload/file-upload-service';

@Processor('appQueue', { concurrency: 3 }) // Can run up to 3 jobs concurrently
export class QueueWorker extends WorkerHost {
  constructor(
    private readonly mailerService: MailerService,
    private readonly fileUploadService: FileUploadService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'email') {
      await this.mailerService.sendMail(
        job?.data?.email!,
        job?.data?.subject!,
        job?.data?.message!,
      );
    } else {
      const result = await this.fileUploadService.uploadFileToCloud(
        job?.data?.buffer,
      );
      return result;
    }
  }

  //  @OnWorkerEvent('active')
  // onActive(job: Job) {
  //   console.log(`Processing job with id ${job.id}`);
  // }

  // @OnWorkerEvent('completed')
  // onCompleted(job: Job) {
  //   console.log(`Job with id ${job.id} COMPLETED!`);
  // }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log(
      `Job with id ${job.id} FAILED! Attempt Number ${job.attemptsMade}`,
    );
  }
}
