// src/queue/queue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('appQueue') private readonly userQueue: Queue) {}

  async addJob(name: string, data: any, delay: number) {
    return this.userQueue.add(name, data, { delay });
  }

  // Add other queue methods as needed
}
