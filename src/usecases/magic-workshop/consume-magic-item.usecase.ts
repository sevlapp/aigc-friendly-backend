import { Injectable, Logger } from '@nestjs/common';
import { AsyncTaskRecordService } from '@src/modules/async-task-record/async-task-record.service';
import type { AsyncTaskRecordSource } from '@src/modules/async-task-record/async-task-record.types';
import { MagicItemCraftService } from '@src/modules/magic-workshop/services/magic-item-craft.service';
import type {
  ConsumeMagicItemCraftTaskInput,
  ConsumeMagicItemCraftTaskResult,
  MagicQualityLevel,
} from '@src/modules/magic-workshop/magic-item.types';
import { MAGIC_QUALITY_LEVELS } from '@src/modules/magic-workshop/magic-item.types';

export interface ConsumeMagicItemCraftTaskProcessInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly payload: {
    readonly itemName: string;
    readonly itemType: string;
    readonly materialLevel: number;
    readonly requestNote?: string;
    readonly actorAccountId?: number | null;
    readonly actorActiveRole?: string | null;
  };
  readonly attemptsMade: number;
  readonly maxAttempts?: number;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
}

export interface ConsumeMagicItemCraftTaskCompleteInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly attemptsMade: number;
  readonly maxAttempts?: number;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
  readonly finishedAt?: Date;
}

export interface ConsumeMagicItemCraftTaskFailInput extends ConsumeMagicItemCraftTaskCompleteInput {
  readonly bizType?: 'magic_craft' | 'magic_worker';
  readonly bizKey?: string;
  readonly reason?: string;
  readonly occurredAt?: Date;
  readonly error?: unknown;
}

@Injectable()
export class ConsumeMagicItemCraftTaskUsecase {
  private readonly logger = new Logger(ConsumeMagicItemCraftTaskUsecase.name);

  constructor(
    private readonly magicItemCraftService: MagicItemCraftService,
    private readonly asyncTaskRecordService: AsyncTaskRecordService,
  ) {}

  async process(
    input: ConsumeMagicItemCraftTaskProcessInput,
  ): Promise<ConsumeMagicItemCraftTaskResult> {
    const occurredAt = new Date();

    await this.asyncTaskRecordService.recordStarted({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: 'magic_craft',
        bizKey: input.traceId,
        source: this.resolveSource(),
        reason: 'worker_processing',
        attemptCount: this.resolveProcessingAttemptCount({ attemptsMade: input.attemptsMade }),
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        occurredAt: input.startedAt,
      },
    });

    await this.magicItemCraftService.updateTaskStatus({
      data: {
        jobId: input.jobId,
        status: 'PROCESSING',
      },
    });

    this.logger.log(
      {
        jobId: input.jobId,
        traceId: input.traceId,
        itemName: input.payload.itemName,
        itemType: input.payload.itemType,
        materialLevel: input.payload.materialLevel,
      },
      'Processing magic item craft task',
    );

    const qualityLevel = this.determineQualityLevel(input.payload.materialLevel);
    const resultDescription = this.generateResultDescription(
      input.payload.itemName,
      input.payload.itemType,
      qualityLevel,
      input.payload.requestNote,
    );

    return {
      accepted: true,
      qualityLevel,
      resultDescription,
    };
  }

  async complete(input: ConsumeMagicItemCraftTaskCompleteInput): Promise<void> {
    await this.asyncTaskRecordService.recordFinished({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: 'magic_craft',
        bizKey: input.traceId,
        source: this.resolveSource(),
        status: 'succeeded',
        reason: 'worker_completed',
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        occurredAt: input.finishedAt,
        attemptCount: input.attemptsMade,
      },
    });

    this.logger.log(
      {
        jobId: input.jobId,
        traceId: input.traceId,
      },
      'Magic item craft task completed',
    );
  }

  async fail(input: ConsumeMagicItemCraftTaskFailInput): Promise<void> {
    const occurredAt = input.occurredAt ?? new Date();
    const bizKey = input.bizKey ?? input.traceId;
    const reason = input.reason ?? 'worker_failed:unknown';

    await this.magicItemCraftService.updateTaskStatus({
      data: {
        jobId: input.jobId,
        status: 'FAILED',
        failureReason: reason,
      },
    });

    await this.asyncTaskRecordService.recordFinished({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: input.bizType ?? 'magic_craft',
        bizKey,
        source: this.resolveSource(),
        status: 'failed',
        reason,
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        finishedAt: occurredAt,
        occurredAt,
        attemptCount: input.attemptsMade,
      },
    });

    this.logger.warn(
      {
        jobId: input.jobId,
        traceId: input.traceId,
        reason,
      },
      'Magic item craft task failed',
    );
  }

  private resolveSource(): AsyncTaskRecordSource {
    return 'system';
  }

  private resolveProcessingAttemptCount(input: { readonly attemptsMade: number }): number {
    return input.attemptsMade + 1;
  }

  private determineQualityLevel(materialLevel: number): MagicQualityLevel {
    const random = Math.random();
    const boost = (materialLevel - 1) / 10;

    if (random < 0.05 + boost) {
      return 'LEGENDARY';
    }
    if (random < 0.15 + boost) {
      return 'EPIC';
    }
    if (random < 0.35 + boost) {
      return 'RARE';
    }
    return 'COMMON';
  }

  private generateResultDescription(
    itemName: string,
    itemType: string,
    qualityLevel: MagicQualityLevel,
    requestNote?: string,
  ): string {
    const qualityPrefix = {
      COMMON: '普通的',
      RARE: '精致的',
      EPIC: '稀有的',
      LEGENDARY: '传说级的',
    }[qualityLevel];

    const typeNames: Record<string, string> = {
      WEAPON: '武器',
      ARMOR: '护甲',
      TOOL: '工具',
      TOY: '玩具',
    };

    const typeName = typeNames[itemType] || '物品';
    const note = requestNote ? `（${requestNote}）` : '';

    return `${qualityPrefix}${typeName}"${itemName}"${note}。散发着独特的光芒，蕴含着工匠的心血与魔法。`;
  }
}
