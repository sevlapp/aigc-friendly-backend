// src/adapters/api/graphql/blog/dto/comment.input.ts

import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { trimText } from '@src/adapters/api/graphql/common/input-normalizers';
import { CommentStatus } from '@src/modules/blog/entities/comment.entity';

@InputType()
export class CreateCommentInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  postId!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;

  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEmail()
  authorEmail?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  content!: string;
}

@InputType()
export class UpdateCommentInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => CommentStatus, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  parentId?: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @Field(() => Boolean)
  @IsBoolean()
  isActive!: boolean;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id!: number;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  parentId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
