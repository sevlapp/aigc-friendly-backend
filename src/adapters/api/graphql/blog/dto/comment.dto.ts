// src/adapters/api/graphql/blog/dto/comment.dto.ts

import { Field, ObjectType } from '@nestjs/graphql';
import { PostDTO } from './post.dto';

@ObjectType()
export class CommentDTO {
  @Field(() => Number)
  id!: number;

  @Field(() => Number)
  postId!: number;

  @Field(() => Number, { nullable: true })
  parentId?: number;

  @Field(() => String)
  authorName!: string;

  @Field(() => String, { nullable: true })
  authorEmail?: string;

  @Field(() => String, { nullable: true })
  authorAvatar?: string;

  @Field(() => String)
  content!: string;

  @Field(() => String)
  status!: string;

  @Field(() => Number)
  likeCount!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => [CommentDTO], { nullable: true })
  replies?: CommentDTO[];
}

@ObjectType()
export class LinkDTO {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => Number)
  sortOrder!: number;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class ConfigDTO {
  @Field(() => String)
  key!: string;

  @Field(() => String, { nullable: true })
  value?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@ObjectType()
export class BlogStatsDTO {
  @Field(() => Number)
  totalPosts!: number;

  @Field(() => Number)
  totalComments!: number;

  @Field(() => Number)
  totalViews!: number;

  @Field(() => Number)
  totalLikes!: number;

  @Field(() => Number)
  publishedPosts!: number;

  @Field(() => Number)
  pendingComments!: number;
}

@ObjectType()
export class ArchiveStatsDTO {
  @Field(() => Number)
  year!: number;

  @Field(() => Number)
  month!: number;

  @Field(() => Number)
  count!: number;
}

@ObjectType()
export class PostListResult {
  @Field(() => [PostDTO])
  posts!: PostDTO[];

  @Field(() => Number)
  total!: number;

  @Field(() => Number)
  page!: number;

  @Field(() => Number)
  pageSize!: number;
}
