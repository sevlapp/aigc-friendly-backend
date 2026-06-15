// src/adapters/api/graphql/blog/dto/queue-comment-email-notification.result.ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QueueCommentEmailNotificationResult {
  @Field()
  jobId!: string;

  @Field()
  traceId!: string;
}