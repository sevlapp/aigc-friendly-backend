// src/adapters/api/graphql/blog/dto/post.input.ts

import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { trimText } from '@src/adapters/api/graphql/common/input-normalizers';
import { PostStatus, PostVisibility } from '@src/types/models/blog.types';

@InputType()
export class CreatePostInput {
  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  excerpt?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Field(() => PostStatus)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsEnum(PostStatus)
  status!: PostStatus;

  @Field(() => PostVisibility)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsEnum(PostVisibility)
  visibility!: PostVisibility;

  @Field(() => Boolean)
  @IsBoolean()
  isSticky!: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}

@InputType()
export class UpdatePostInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id!: number;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  excerpt?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Field(() => PostStatus, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @Field(() => PostVisibility, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isSticky?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}
