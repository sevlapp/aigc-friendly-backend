// src/adapters/api/graphql/blog/dto/tag.input.ts

import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { trimText } from '@src/adapters/api/graphql/common/input-normalizers';

@InputType()
export class CreateTagInput {
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
}

@InputType()
export class UpdateTagInput {
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
}

@InputType()
export class CreateLinkInput {
  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsString()
  @IsNotEmpty()
  url!: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @Field(() => Boolean)
  @IsBoolean()
  isActive!: boolean;
}

@InputType()
export class UpdateLinkInput {
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
  url?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: TransformFnParams) => trimText(value))
  @IsOptional()
  @IsString()
  avatar?: string;

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
