import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MagicItemTypeEnum } from '@src/modules/magic-workshop/magic-item.types';

@ObjectType()
export class MagicItemCraftTaskResult {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  jobId!: string;

  @Field(() => String)
  traceId!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  itemName!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class MagicItemCraftTaskDetail {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  itemName!: string;

  @Field(() => MagicItemTypeEnum) // ✅ 修正：改为枚举类型
  itemType!: MagicItemTypeEnum;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  qualityLevel!: string | null;

  @Field(() => String, { nullable: true })
  resultDescription!: string | null;

  @Field(() => String, { nullable: true })
  failureReason!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
