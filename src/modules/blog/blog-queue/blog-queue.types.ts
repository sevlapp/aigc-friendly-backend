// src/modules/blog/blog-queue/blog-queue.types.ts
export interface QueueCommentEmailNotificationInput {
  readonly commentId: string;
  readonly postId: string;
  readonly authorEmail: string;
  readonly authorName: string;
  readonly postTitle: string;
  readonly commentContent: string;
  readonly dedupKey?: string;
  readonly traceId?: string;
}

export interface QueueCommentEmailNotificationResult {
  readonly jobId: string;
  readonly traceId: string;
}