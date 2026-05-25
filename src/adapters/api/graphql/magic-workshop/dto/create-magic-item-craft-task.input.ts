import { Field, InputType } from '@nestjs/graphql';
import { MagicItemTypeEnum } from '@src/modules/magic-workshop/magic-item.types';
import { IsString, MaxLength, IsIn, IsInt, Max, IsOptional } from 'class-validator';

const MAGIC_ITEM_TYPES = ['WEAPON', 'ARMOR', 'TOOL', 'TOY'] as const;

@InputType()
export class CreateMagicItemCraftTaskInput {
  @Field(() => String, { description: '道具名称' })
  @IsString({ message: '道具名称必须是字符串' })
  @MaxLength(128, { message: '道具名称长度不能超过 128 个字符' })
  itemName!: string;

  @Field(() => MagicItemTypeEnum, { description: '道具类型：WEAPON / ARMOR / TOOL / TOY' })
  @IsIn(MAGIC_ITEM_TYPES, { message: '道具类型不在允许范围内' })
  itemType!: MagicItemTypeEnum;

  @Field(() => Number, { description: '材料等级 1-5' })
  @IsInt({ message: '材料等级必须是整数' })
  @Max(5, { message: '材料等级最大为 5' })
  materialLevel!: number;

  @Field(() => String, { nullable: true, description: '请求备注' })
  @IsOptional()
  @IsString({ message: '请求备注必须是字符串' })
  @MaxLength(512, { message: '请求备注长度不能超过 512 个字符' })
  requestNote?: string;

  @Field(() => String, { nullable: true, description: '幂等键' })
  @IsOptional()
  @IsString({ message: '幂等键必须是字符串' })
  dedupKey?: string;

  @Field(() => String, { nullable: true, description: '链路追踪 ID' })
  @IsOptional()
  @IsString({ message: '链路追踪 ID 必须是字符串' })
  traceId?: string;
}
