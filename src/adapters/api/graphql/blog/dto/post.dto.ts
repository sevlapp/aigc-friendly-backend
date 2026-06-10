// src/adapters/api/graphql/blog/dto/post.dto.ts

import { Field, ObjectType } from '@nestjs/graphql';
import { CategoryView, TagView } from '@src/modules/blog/blog.types';

@ObjectType()
export class PostDTO {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  excerpt?: string;

  @Field(() => String)
  content!: string;

  @Field(() => String, { nullable: true })
  coverImage?: string;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  visibility!: string;

  @Field(() => Number)
  viewCount!: number;

  @Field(() => Number)
  likeCount!: number;

  @Field(() => Boolean)
  isSticky!: boolean;

  @Field(() => Number, { nullable: true })
  categoryId?: number;

  @Field(() => String, { nullable: true })
  categoryName?: string;

  @Field(() => [TagDTO])
  tags!: TagDTO[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Number)
  commentCount!: number;
}

@ObjectType()
export class TagDTO {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Number)
  postCount!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class CategoryDTO {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Number, { nullable: true })
  parentId?: number;

  @Field(() => Number)
  sortOrder!: number;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => Number)
  postCount!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => [CategoryDTO], { nullable: true })
  children?: CategoryDTO[];
}