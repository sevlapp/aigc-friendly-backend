// src/adapters/api/graphql/blog/dto/query.input.ts

import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { trimText } from '@src/adapters/api/graphql/common/input-normalizers';
import { PostStatus } from '@src/modules/blog/entities/post.entity';
import { CommentStatus } from '@src/modules/blog/entities/comment.entity';

@ArgsType()
export class PostQueryArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  tagId?: number;

  @Field(() => PostStatus, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

@ArgsType()
export class CommentQueryArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  postId?: number;

  @Field(() => CommentStatus, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}

@ArgsType()
export class PostByIdArgs {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id!: number;
}

@ArgsType()
export class PostBySlugArgs {
  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsOptional()
  slug!: string;
}

@InputType()
export class UpdateConfigInput {
  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  key!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  value?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  description?: string;
}