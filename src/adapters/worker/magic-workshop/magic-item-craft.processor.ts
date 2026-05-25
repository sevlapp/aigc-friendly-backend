import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { MagicItemCraftHandler } from './magic-item-craft.handler';
import {
  MAGIC_CRAFT_JOB_NAME,
  MAGIC_WORKSHOP_QUEUE_NAME,
  type MagicCraftFailedJob,
  type MagicCraftJob,
} from './magic-item-craft.mapper';

@Injectable()
@Processor(MAGIC_WORKSHOP_QUEUE_NAME)
export class MagicItemCraftProcessor extends WorkerHost {
  constructor(private readonly handler: MagicItemCraftHandler) {
    super();
  }

  async process(job: MagicCraftJob): Promise<void> {
    if (job.name === MAGIC_CRAFT_JOB_NAME) {
      return await this.handler.process({ job });
    }
    throw new Error(`Unsupported magic workshop job: ${job.name}`);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: MagicCraftJob): Promise<void> {
    if (job.name === MAGIC_CRAFT_JOB_NAME) {
      await this.handler.onCompleted({ job });
      return;
    }
    throw new Error(`Unsupported magic workshop job: ${job.name}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: MagicCraftFailedJob, error: Error): Promise<void> {
    await this.handler.onFailed({ job, error });
  }
}
