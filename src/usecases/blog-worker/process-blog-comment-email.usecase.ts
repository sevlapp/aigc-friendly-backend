// src/usecases/blog-worker/process-blog-comment-email.usecase.ts
import { Injectable } from '@nestjs/common';
import { EmailQueueService } from '@src/modules/common/email-queue/email-queue.service';
import { PinoLogger } from 'nestjs-pino';

export interface ProcessBlogCommentEmailInput {
  readonly commentId: string;
  readonly postId: string;
  readonly authorEmail: string;
  readonly authorName: string;
  readonly postTitle: string;
  readonly commentContent: string;
  readonly traceId?: string;
}

@Injectable()
export class ProcessBlogCommentEmailUsecase {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProcessBlogCommentEmailUsecase.name);
  }

  async execute(input: ProcessBlogCommentEmailInput): Promise<void> {
    this.logger.info(
      {
        commentId: input.commentId,
        postId: input.postId,
        authorEmail: input.authorEmail,
        traceId: input.traceId,
      },
      'Processing blog comment email notification',
    );

    try {
      await this.emailQueueService.enqueueSend({
        to: input.authorEmail,
        subject: `新评论：${input.postTitle}`,
        html: this.generateEmailHtml(input),
        dedupKey: `blog-comment-${input.commentId}`,
        traceId: input.traceId,
      });

      this.logger.info(
        {
          commentId: input.commentId,
          traceId: input.traceId,
        },
        'Blog comment email notification sent successfully',
      );
    } catch (error) {
      this.logger.error(
        {
          commentId: input.commentId,
          error: error instanceof Error ? error.message : String(error),
          traceId: input.traceId,
        },
        'Failed to send blog comment email notification',
      );
      throw error;
    }
  }

  private generateEmailHtml(input: ProcessBlogCommentEmailInput): string {
    return `
      <html>
        <body>
          <h2>新评论通知</h2>
          <p>您好，${input.authorName}！</p>
          <p>您的文章 <strong>${input.postTitle}</strong> 收到了一条新评论：</p>
          <blockquote>${input.commentContent}</blockquote>
          <p>请登录后台查看详情。</p>
        </body>
      </html>
    `;
  }
}