import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConsumeMagicItemCraftTaskUsecase } from '@src/usecases/magic-workshop/consume-magic-item.usecase';
import {
  mapMagicCraftJobToCompleteInput,
  mapMagicCraftJobToFailInput,
  mapMagicCraftJobToProcessInput,
  mapMissingMagicCraftJobToFailInput,
  mapUnknownMagicCraftJobToFailInput,
  MAGIC_CRAFT_JOB_NAME,
  type MagicCraftFailedJob,
  type MagicCraftJob,
} from './magic-item-craft.mapper';

@Injectable()
export class MagicItemCraftHandler {
  constructor(
    private readonly consumeMagicItemCraftTaskUsecase: ConsumeMagicItemCraftTaskUsecase,
  ) {}

  async process(input: { readonly job: MagicCraftJob }): Promise<void> {
    if (input.job.name !== MAGIC_CRAFT_JOB_NAME) {
      throw new Error(`Unsupported magic workshop job: ${input.job.name}`);
    }

    const processInput = mapMagicCraftJobToProcessInput({ job: input.job });
    await this.consumeMagicItemCraftTaskUsecase.process(processInput);

    await this.consumeMagicItemCraftTaskUsecase.complete(
      mapMagicCraftJobToCompleteInput({ job: input.job }),
    );
  }

  async onCompleted(input: { readonly job: MagicCraftJob }): Promise<void> {
    await this.consumeMagicItemCraftTaskUsecase.complete(
      mapMagicCraftJobToCompleteInput({ job: input.job }),
    );
  }

  async onFailed(input: {
    readonly job: MagicCraftFailedJob;
    readonly error: Error;
  }): Promise<void> {
    if (!input.job) {
      await this.consumeMagicItemCraftTaskUsecase.fail(
        mapMissingMagicCraftJobToFailInput({ error: input.error }),
      );
      return;
    }

    if (input.job.name === MAGIC_CRAFT_JOB_NAME) {
      await this.consumeMagicItemCraftTaskUsecase.fail(
        mapMagicCraftJobToFailInput({
          job: input.job as MagicCraftJob,
          error: input.error,
        }),
      );
      return;
    }

    await this.consumeMagicItemCraftTaskUsecase.fail(
      mapUnknownMagicCraftJobToFailInput({
        job: input.job as Job<unknown, unknown>,
        error: input.error,
      }),
    );
  }
}
