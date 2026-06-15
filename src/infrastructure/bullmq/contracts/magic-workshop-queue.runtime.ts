import { MagicItemTypeEnum } from '@src/modules/magic-workshop/magic-item.types';
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '../bullmq.constants';
import { isNonEmptyString, isOptionalNonEmptyString, isRecord } from './shared-payload-validators';

export const MAGIC_ITEM_TYPES = ['WEAPON', 'ARMOR', 'TOOL', 'TOY'] as const;
export type MagicItemType = (typeof MAGIC_ITEM_TYPES)[number];

export const MAGIC_QUALITY_LEVELS = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;
export type MagicQualityLevel = (typeof MAGIC_QUALITY_LEVELS)[number];

export const MAGIC_CRAFT_STATUSES = ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED'] as const;
export type MagicCraftStatus = (typeof MAGIC_CRAFT_STATUSES)[number];

export interface MagicCraftPayload {
  readonly itemName: string;
  readonly itemType: MagicItemTypeEnum;
  readonly materialLevel: number;
  readonly requestNote?: string;
  readonly traceId: string;
  readonly actorAccountId?: number | null;
  readonly actorActiveRole?: string | null;
}

export interface MagicCraftResult {
  readonly accepted: boolean;
  readonly craftId: string;
  readonly qualityLevel?: MagicQualityLevel;
  readonly resultDescription?: string;
  readonly failureReason?: string;
}

const isMagicItemType = (value: unknown): value is MagicItemTypeEnum => {
  return (
    typeof value === 'string' &&
    Object.values(MagicItemTypeEnum).includes(value as MagicItemTypeEnum)
  );
};

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

const isMagicCraftPayload = (payload: unknown): payload is MagicCraftPayload => {
  if (!isRecord(payload)) return false;
  const materialLevel = payload.materialLevel;
  return (
    isNonEmptyString(payload.itemName) &&
    isMagicItemType(payload.itemType) &&
    isNumber(materialLevel) &&
    materialLevel >= 1 &&
    materialLevel <= 5 &&
    isOptionalNonEmptyString(payload.requestNote) &&
    isNonEmptyString(payload.traceId)
  );
};

export const MAGIC_WORKSHOP_JOB_CONTRACT = {
  [BULLMQ_JOBS.MAGIC_WORKSHOP.CRAFT]: {
    payload: {} as MagicCraftPayload,
    result: {} as MagicCraftResult,
    payloadValidator: isMagicCraftPayload,
  },
} as const;

export const MAGIC_WORKSHOP_QUEUE_CONTRACT = {
  queueName: BULLMQ_QUEUES.MAGIC_WORKSHOP,
  jobs: MAGIC_WORKSHOP_JOB_CONTRACT,
} as const;
