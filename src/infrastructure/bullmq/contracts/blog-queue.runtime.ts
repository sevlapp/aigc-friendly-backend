// src/infrastructure/bullmq/contracts/blog-queue.runtime.ts
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '../bullmq.constants';
import {
  isNonEmptyString,
  isOptionalNonEmptyString,
  isRecord,
} from './shared-payload-validators';

export interface CommentEmailNotificationPayload {
  readonly commentId: string;
  readonly postId: string;
  readonly authorEmail: string;
  readonly authorName: string;
  readonly postTitle: string;
  readonly commentContent: string;
  readonly traceId?: string;
}

export interface CommentEmailNotificationResult {
  readonly accepted: boolean;
  readonly providerMessageId: string;
}

const isCommentEmailNotificationPayload = (
  payload: unknown,
): payload is CommentEmailNotificationPayload => {
  if (!isRecord(payload)) return false;
  return (
    isNonEmptyString(payload.commentId) &&
    isNonEmptyString(payload.postId) &&
    isNonEmptyString(payload.authorEmail) &&
    isNonEmptyString(payload.authorName) &&
    isNonEmptyString(payload.postTitle) &&
    isNonEmptyString(payload.commentContent) &&
    isOptionalNonEmptyString(payload.traceId)
  );
};

export const BLOG_JOB_CONTRACT = {
  [BULLMQ_JOBS.BLOG.COMMENT_EMAIL_NOTIFICATION]: {
    payload: {} as CommentEmailNotificationPayload,
    result: {} as CommentEmailNotificationResult,
    payloadValidator: isCommentEmailNotificationPayload,
  },
} as const;

export const BLOG_QUEUE_CONTRACT = {
  queueName: BULLMQ_QUEUES.BLOG,
  jobs: BLOG_JOB_CONTRACT,
} as const;