// src/modules/blog/blog-queue/blog-queue.module.ts
import { BullMqModule } from '@src/infrastructure/bullmq/bullmq.module';
import { Module } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { BlogQueueService } from './blog-queue.service';

@Module({
  imports: [BullMqModule],
  providers: [BlogQueueService, PinoLogger],
  exports: [BlogQueueService],
})
export class BlogQueueModule {}