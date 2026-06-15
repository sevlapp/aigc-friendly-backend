// src/adapters/api/graphql/blog/dto/queue-comment-email-notification.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class QueueCommentEmailNotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  authorEmail!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  postTitle!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  commentContent!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  dedupKey?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  traceId?: string;
}