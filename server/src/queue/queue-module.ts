import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue-service';
import { QueueWorker } from './queue-worker';
import { AppQueueEventsListener } from './queue-events';
import { MailerModule } from '../common/mailer/mailer.module';
import { FileUploadModule } from '../common/file-upload/file-upload-module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appQueue',
    }),
    MailerModule,
    FileUploadModule,
  ],
  providers: [QueueService, QueueWorker, AppQueueEventsListener],
  exports: [QueueService],
})
export class QueueModule {}
