// src/usecases/blog/config.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { ConfigView, UpdateConfigInput } from '@src/modules/blog/blog.types';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';

@Injectable()
export class UpdateConfigUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: UpdateConfigInput): Promise<ConfigView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      await this.blogService.setConfig(input, transactionContext);
      const configs = await this.blogQueryService.getConfig();
      return configs.find((c) => c.key === input.key) || null;
    });
  }
}