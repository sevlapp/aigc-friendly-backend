import { Injectable } from '@nestjs/common';
import { AsyncTaskRecordService } from '@src/modules/async-task-record/async-task-record.service';
import type { AsyncTaskRecordSource } from '@src/modules/async-task-record/async-task-record.types';
import { MagicItemCraftService } from '@src/modules/magic-workshop/services/magic-item-craft.service';
import { MagicItemTypeEnum } from '@src/modules/magic-workshop/magic-item.types';
import type {
  MagicCraftStatus,
  MagicItemCraftTaskView,
  MagicItemType,
  QueueMagicItemResult,
} from '@src/modules/magic-workshop/magic-item.types';

type QueueMagicItemActorInput = {
  readonly actorAccountId?: number | null;
  readonly actorActiveRole?: string | null;
};

export interface QueueMagicItemUsecaseInput {
  readonly itemName: string;
  readonly itemType: MagicItemType;
  readonly materialLevel: number;
  readonly requestNote?: string;
  readonly dedupKey?: string;
  readonly traceId?: string;
}

type QueueMagicItemFullInput = QueueMagicItemUsecaseInput & QueueMagicItemActorInput;

export interface QueueMagicItemUsecaseResult {
  readonly id: number;
  readonly jobId: string;
  readonly traceId: string;
  readonly status: MagicCraftStatus;
  readonly itemName: string;
  readonly createdAt: Date;
}

@Injectable()
export class QueueMagicItemUsecase {
  constructor(
    private readonly magicItemCraftService: MagicItemCraftService,
    private readonly asyncTaskRecordService: AsyncTaskRecordService,
  ) {}

  async execute(input: QueueMagicItemFullInput): Promise<QueueMagicItemUsecaseResult> {
    const occurredAt = new Date();
    const enqueueResult = await this.enqueueCraftOrThrow({
      input,
      occurredAt,
    });

    await this.magicItemCraftService.createTask({
      data: {
        itemName: input.itemName,
        itemType: input.itemType as MagicItemTypeEnum,
        materialLevel: input.materialLevel,
        requestNote: input.requestNote,
        traceId: enqueueResult.traceId,
        actorAccountId: input.actorAccountId,
        actorActiveRole: input.actorActiveRole,
        jobId: enqueueResult.jobId,
      },
    });

    await this.asyncTaskRecordService.recordEnqueued({
      data: {
        queueName: 'magic-workshop',
        jobName: 'craft',
        jobId: enqueueResult.jobId,
        traceId: enqueueResult.traceId,
        actorAccountId: input.actorAccountId,
        actorActiveRole: input.actorActiveRole,
        bizType: 'magic_craft',
        bizKey: enqueueResult.traceId,
        source: this.resolveSource(),
        reason: 'enqueue_accepted',
        occurredAt,
        dedupKey: input.dedupKey,
      },
    });

    const task = await this.magicItemCraftService.findByJobId({ jobId: enqueueResult.jobId });

    return {
      id: task?.id ?? 0,
      jobId: enqueueResult.jobId,
      traceId: enqueueResult.traceId,
      status: 'PENDING',
      itemName: input.itemName,
      createdAt: task?.createdAt ?? occurredAt,
    };
  }

  private async enqueueCraftOrThrow(input: {
    readonly input: QueueMagicItemFullInput;
    readonly occurredAt: Date;
  }): Promise<QueueMagicItemResult> {
    try {
      return await this.magicItemCraftService.enqueueCraft({
        itemName: input.input.itemName,
        itemType: input.input.itemType as MagicItemTypeEnum,
        materialLevel: input.input.materialLevel,
        requestNote: input.input.requestNote,
        traceId: input.input.traceId,
        dedupKey: input.input.dedupKey,
      });
    } catch (error: unknown) {
      const normalizedError =
        error instanceof Error ? error : new Error('magic_craft_enqueue_failed');
      const fallbackJobId = `magic-craft-enqueue-failed:${input.occurredAt.getTime()}`;
      const traceId = input.input.traceId ?? `magic-craft-enqueue:${input.occurredAt.getTime()}`;

      await this.asyncTaskRecordService.recordEnqueueFailed({
        data: {
          queueName: 'magic-workshop',
          jobName: 'craft',
          jobId: fallbackJobId,
          traceId,
          actorAccountId: input.input.actorAccountId,
          actorActiveRole: input.input.actorActiveRole,
          bizType: 'magic_craft',
          bizKey: traceId,
          source: this.resolveSource(),
          reason: `enqueue_failed:${normalizedError.message}`,
          occurredAt: input.occurredAt,
          dedupKey: input.input.dedupKey,
        },
      });
      throw normalizedError;
    }
  }

  private resolveSource(): AsyncTaskRecordSource {
    return 'user_action';
  }
}
