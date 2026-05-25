import type { ConsumeMagicItemCraftTaskFailInput, ConsumeMagicItemCraftTaskProcessInput } from '@src/usecases/magic-workshop/consume-magic-item.usecase';
import type { Job } from 'bullmq';
import type { MagicCraftPayload, MagicCraftResult } from '@src/infrastructure/bullmq/contracts/magic-workshop-queue.runtime';

export const MAGIC_WORKSHOP_QUEUE_NAME = 'magic-workshop';
export const MAGIC_CRAFT_JOB_NAME = 'craft';

export type MagicCraftJob = Job<MagicCraftPayload, MagicCraftResult>;
export type MagicCraftFailedJob = Job<MagicCraftPayload, MagicCraftResult> | undefined;

export function mapMagicCraftJobToProcessInput(input: {
  readonly job: MagicCraftJob;
}): ConsumeMagicItemCraftTaskProcessInput {
  const { job } = input;
  return {
    queueName: job.queueName ?? MAGIC_WORKSHOP_QUEUE_NAME,
    jobName: job.name ?? MAGIC_CRAFT_JOB_NAME,
    jobId: typeof job.id === 'number' ? String(job.id) : (job.id ?? 'unknown'),
    traceId: job.data.traceId ?? 'unknown',
    payload: {
      itemName: job.data.itemName,
      itemType: job.data.itemType,
      materialLevel: job.data.materialLevel,
      requestNote: job.data.requestNote,
      actorAccountId: job.data.actorAccountId,
      actorActiveRole: job.data.actorActiveRole,
    },
    attemptsMade: job.attemptsMade ?? 0,
    maxAttempts: job.opts?.attempts ? job.opts.attempts : undefined,
    enqueuedAt: job.timestamp ? new Date(job.timestamp) : undefined,
    startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
  };
}

export function mapMagicCraftJobToCompleteInput(input: {
  readonly job: MagicCraftJob;
}): {
  queueName: string;
  jobName: string;
  jobId: string;
  traceId: string;
  attemptsMade: number;
  maxAttempts?: number;
  enqueuedAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
} {
  const { job } = input;
  return {
    queueName: job.queueName ?? MAGIC_WORKSHOP_QUEUE_NAME,
    jobName: job.name ?? MAGIC_CRAFT_JOB_NAME,
    jobId: typeof job.id === 'number' ? String(job.id) : (job.id ?? 'unknown'),
    traceId: job.data.traceId ?? 'unknown',
    attemptsMade: job.attemptsMade ?? 0,
    maxAttempts: job.opts?.attempts ? job.opts.attempts : undefined,
    enqueuedAt: job.timestamp ? new Date(job.timestamp) : undefined,
    startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
  };
}

export function mapMagicCraftJobToFailInput(input: {
  readonly job: MagicCraftJob;
  readonly error: Error;
}): ConsumeMagicItemCraftTaskFailInput {
  const { job, error } = input;
  return {
    queueName: job.queueName ?? MAGIC_WORKSHOP_QUEUE_NAME,
    jobName: job.name ?? MAGIC_CRAFT_JOB_NAME,
    jobId: typeof job.id === 'number' ? String(job.id) : (job.id ?? 'unknown'),
    traceId: job.data.traceId ?? 'unknown',
    attemptsMade: job.attemptsMade ?? 0,
    maxAttempts: job.opts?.attempts ? job.opts.attempts : undefined,
    enqueuedAt: job.timestamp ? new Date(job.timestamp) : undefined,
    startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
    finishedAt: new Date(),
    bizType: 'magic_craft',
    bizKey: job.data.traceId ?? 'unknown',
    reason: `worker_failed:${error.message}`,
    occurredAt: new Date(),
    error,
  };
}

export function mapMissingMagicCraftJobToFailInput(input: {
  readonly error: Error;
}): ConsumeMagicItemCraftTaskFailInput {
  const { error } = input;
  const fallbackTraceId = `magic-craft-missing-job:${Date.now()}`;
  return {
    queueName: MAGIC_WORKSHOP_QUEUE_NAME,
    jobName: MAGIC_CRAFT_JOB_NAME,
    jobId: `missing-job:${Date.now()}`,
    traceId: fallbackTraceId,
    attemptsMade: 0,
    bizType: 'magic_worker',
    bizKey: fallbackTraceId,
    reason: `worker_event_job_missing:${error.message}`,
    occurredAt: new Date(),
    error,
  };
}

export function mapUnknownMagicCraftJobToFailInput(input: {
  readonly job: Job<unknown, unknown>;
  readonly error: Error;
}): ConsumeMagicItemCraftTaskFailInput {
  const { job, error } = input;
  const fallbackTraceId = `magic-craft-unknown-job:${Date.now()}`;
  return {
    queueName: job.queueName ?? MAGIC_WORKSHOP_QUEUE_NAME,
    jobName: job.name ?? 'unknown',
    jobId: typeof job.id === 'number' ? String(job.id) : (job.id ?? 'unknown'),
    traceId: fallbackTraceId,
    attemptsMade: job.attemptsMade ?? 0,
    bizType: 'magic_worker',
    bizKey: fallbackTraceId,
    reason: `unsupported_magic_job:${error.message}`,
    occurredAt: new Date(),
    error,
  };
}
