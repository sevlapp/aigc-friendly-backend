// src/adapters/worker/blog/blog-worker-adapter.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ProcessBlogCommentEmailUsecase } from '@src/usecases/blog-worker/process-blog-comment-email.usecase';
import type { CommentEmailNotificationPayload } from '@src/infrastructure/bullmq/contracts/blog-queue.runtime';

@Injectable()
export class BlogWorkerAdapter {
  constructor(
    private readonly processBlogCommentEmailUsecase: ProcessBlogCommentEmailUsecase,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BlogWorkerAdapter.name);
  }

  async processCommentEmailNotification(payload: CommentEmailNotificationPayload): Promise<void> {
    this.logger.info(
      {
        commentId: payload.commentId,
        postId: payload.postId,
        traceId: payload.traceId,
      },
      'Processing blog comment email notification',
    );
    await this.processBlogCommentEmailUsecase.execute({
      commentId: payload.commentId,
      postId: payload.postId,
      authorEmail: payload.authorEmail,
      authorName: payload.authorName,
      postTitle: payload.postTitle,
      commentContent: payload.commentContent,
      traceId: payload.traceId,
    });
  }
}