// src/usecases/blog/queue-comment-email-notification.usecase.ts
import { Injectable } from '@nestjs/common';
import { BlogQueueService } from '@src/modules/blog/blog-queue/blog-queue.service';
import type {
  QueueCommentEmailNotificationInput,
  QueueCommentEmailNotificationResult,
} from '@src/modules/blog/blog-queue/blog-queue.types';

@Injectable()
export class QueueCommentEmailNotificationUsecase {
  constructor(private readonly blogQueueService: BlogQueueService) {}

  async execute(
    input: QueueCommentEmailNotificationInput,
  ): Promise<QueueCommentEmailNotificationResult> {
    return this.blogQueueService.enqueueCommentEmailNotification(input);
  }
}