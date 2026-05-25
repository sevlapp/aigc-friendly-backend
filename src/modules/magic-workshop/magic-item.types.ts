import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import type { RecordSource } from '@app-types/common/record-source.types';
import { registerEnumType } from '@nestjs/graphql';

export enum MagicItemTypeEnum {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  TOOL = 'TOOL',
  TOY = 'TOY',
  // 根据实际 MAGIC_ITEM_TYPES 补充或修改
}

registerEnumType(MagicItemTypeEnum, {
  name: 'MagicItemType',
});

export const MAGIC_ITEM_TYPES = ['WEAPON', 'ARMOR', 'TOOL', 'TOY'] as const;
export type MagicItemType = (typeof MAGIC_ITEM_TYPES)[number];

export const MAGIC_QUALITY_LEVELS = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;
export type MagicQualityLevel = (typeof MAGIC_QUALITY_LEVELS)[number];

export const MAGIC_CRAFT_STATUSES = ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED'] as const;
export type MagicCraftStatus = (typeof MAGIC_CRAFT_STATUSES)[number];

export interface MagicItemCraftTaskView {
  readonly id: number;
  readonly jobId: string;
  readonly traceId: string;
  readonly actorAccountId: number | null;
  readonly actorActiveRole: string | null;
  readonly itemName: string;
  readonly itemType: MagicItemTypeEnum;
  readonly materialLevel: number;
  readonly requestNote: string | null;
  readonly status: MagicCraftStatus;
  readonly qualityLevel: MagicQualityLevel | null;
  readonly resultDescription: string | null;
  readonly failureReason: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateMagicItemCraftTaskInput {
  readonly itemName: string;
  readonly itemType: MagicItemTypeEnum;
  readonly materialLevel: number;
  readonly requestNote?: string;
  readonly traceId: string;
  readonly actorAccountId?: number | null;
  readonly actorActiveRole?: string | null;
  readonly jobId: string;
}

export interface UpdateMagicItemCraftTaskStatusInput {
  readonly jobId: string;
  readonly status: MagicCraftStatus;
  readonly qualityLevel?: MagicQualityLevel;
  readonly resultDescription?: string;
  readonly failureReason?: string;
}

export interface FindMagicItemCraftTaskByJobIdInput {
  readonly jobId: string;
}

export interface QueueMagicItemInput {
  readonly itemName: string;
  readonly itemType: MagicItemTypeEnum;
  readonly materialLevel: number;
  readonly requestNote?: string;
  readonly traceId?: string;
  readonly dedupKey?: string;
}

export interface QueueMagicItemResult {
  readonly jobId: string;
  readonly traceId: string;
  readonly taskId: number;
}

export interface ConsumeMagicItemCraftTaskInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly payload: {
    readonly itemName: string;
    readonly itemType: MagicItemTypeEnum;
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

export interface ConsumeMagicItemCraftTaskResult {
  readonly accepted: boolean;
  readonly qualityLevel?: MagicQualityLevel;
  readonly resultDescription?: string;
  readonly failureReason?: string;
}

export interface RecordMagicCraftStartedInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly bizType: string;
  readonly bizKey: string;
  readonly source: RecordSource;
  readonly reason?: string | null;
  readonly attemptCount?: number;
  readonly maxAttempts?: number | null;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
  readonly occurredAt?: Date | null;
}

export interface RecordMagicCraftFinishedInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly bizType: string;
  readonly bizKey: string;
  readonly source: RecordSource;
  readonly status: 'succeeded' | 'failed';
  readonly reason?: string | null;
  readonly maxAttempts?: number | null;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
  readonly finishedAt?: Date;
  readonly occurredAt?: Date | null;
  readonly attemptCount?: number;
}
