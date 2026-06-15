// src/modules/blog/blog-queue/blog-queue.service.ts
import { Injectable } from '@nestjs/common';
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { BullMqProducerGateway } from '@src/infrastructure/bullmq/producer.gateway';
import { PinoLogger } from 'nestjs-pino';
import type {
  QueueCommentEmailNotificationInput,
  QueueCommentEmailNotificationResult,
} from './blog-queue.types';

@Injectable()
export class BlogQueueService {
  constructor(
    private readonly producer: BullMqProducerGateway,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BlogQueueService.name);
  }

  async enqueueCommentEmailNotification(
    input: QueueCommentEmailNotificationInput,
  ): Promise<QueueCommentEmailNotificationResult> {
    const job = await this.producer.enqueue({
      queueName: BULLMQ_QUEUES.BLOG,
      jobName: BULLMQ_JOBS.BLOG.COMMENT_EMAIL_NOTIFICATION,
      payload: {
        commentId: input.commentId,
        postId: input.postId,
        authorEmail: input.authorEmail,
        authorName: input.authorName,
        postTitle: input.postTitle,
        commentContent: input.commentContent,
      },
      dedupKey: input.dedupKey,
      traceId: input.traceId,
    });
    this.logger.info(
      {
        commentId: input.commentId,
        postId: input.postId,
        jobId: job.jobId,
        traceId: job.traceId,
      },
      'Blog comment email notification job accepted',
    );
    return {
      jobId: job.jobId,
      traceId: job.traceId,
    };
  }
}