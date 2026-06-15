// src/usecases/blog-worker/blog-worker-usecases.module.ts
import { Module } from '@nestjs/common';
import { EmailQueueModule } from '@src/modules/common/email-queue/email-queue.module';
import { ProcessBlogCommentEmailUsecase } from './process-blog-comment-email.usecase';

@Module({
  imports: [EmailQueueModule],
  providers: [ProcessBlogCommentEmailUsecase],
  exports: [ProcessBlogCommentEmailUsecase],
})
export class BlogWorkerUsecasesModule {}