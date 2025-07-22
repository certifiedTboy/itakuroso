import {
  QueueEventsListener,
  OnQueueEvent,
  QueueEventsHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener('appQueue')
export class AppQueueEventsListener extends QueueEventsHost {
  logger = new Logger('Queue');

  @OnQueueEvent('added')
  onAdded(job: { jobId: string; name: string }) {
    console.log('job added');
    this.logger.log(`Job ${job.jobId} has been added to the queue`);
  }
}
