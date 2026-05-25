import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { JwtPayload } from '@app-types/jwt.types';
import { Args, Field, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { currentUser } from '@src/adapters/api/graphql/decorators/current-user.decorator';
import { QueueMagicItemUsecase } from '@src/usecases/magic-workshop/queue-magic-item.usecase';
import { GetMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/get-magic-item.usecase';
import { CreateMagicItemCraftTaskInput } from './dto/create-magic-item-craft-task.input';
import { MagicItemCraftTaskResult } from './dto/magic-item-craft-task.result';
import { MagicItemCraftTaskDetail } from './dto/magic-item-craft-task.result';
import { MagicItemCraftTaskArgs } from './dto/magic-item-craft-task.args';
import { GraphQLString } from 'graphql';
import { MagicItemTypeEnum } from '@src/modules/magic-workshop/magic-item.types';

@ObjectType()
class MagicItemCraftTaskError {
  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  code?: string;
}

@Resolver()
export class MagicWorkshopResolver {
  constructor(
    private readonly queueMagicItemUsecase: QueueMagicItemUsecase,
    private readonly getMagicItemCraftTaskUsecase: GetMagicItemCraftTaskUsecase,
  ) {}

  @Mutation(() => MagicItemCraftTaskResult)
  @ValidateInput()
  async createMagicItemCraftTask(
    @Args('input') input: CreateMagicItemCraftTaskInput,
    @currentUser() user?: JwtPayload,
  ): Promise<MagicItemCraftTaskResult> {
    const result = await this.queueMagicItemUsecase.execute({
      itemName: input.itemName,
      itemType: input.itemType as 'WEAPON' | 'ARMOR' | 'TOOL' | 'TOY',
      materialLevel: input.materialLevel,
      requestNote: input.requestNote,
      dedupKey: input.dedupKey,
      actorAccountId: user?.sub,
      actorActiveRole: user?.activeRole,
    });

    return {
      id: result.id,
      jobId: result.jobId,
      traceId: result.traceId,
      status: result.status,
      itemName: result.itemName,
      createdAt: result.createdAt,
    };
  }

  @Query(() => MagicItemCraftTaskDetail, { nullable: true })
  async magicItemCraftTask(
    @Args() args: MagicItemCraftTaskArgs,
  ): Promise<MagicItemCraftTaskDetail | null> {
    const result = await this.getMagicItemCraftTaskUsecase.getById(Number(args.id));
    if (!result) {
      return null;
    }
    return {
      id: result.id,
      itemName: result.itemName,
      itemType: result.itemType as MagicItemTypeEnum,
      status: result.status,
      qualityLevel: result.qualityLevel,
      resultDescription: result.resultDescription,
      failureReason: result.failureReason,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
