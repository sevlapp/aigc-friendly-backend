import { Field, ArgsType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class MagicItemCraftTaskArgs {
  @Field(() => String, { description: '任务ID（jobId）' })
  @IsString({ message: '任务ID必须是字符串' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  id!: string;
}
