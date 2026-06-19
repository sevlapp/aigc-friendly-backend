// src/usecases/blog/update-post.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import { mapPostEntityToView } from '@src/modules/blog/entity-mappers';
import type { PostView, UpdatePostInput } from '@src/modules/blog/blog.types';

@Injectable()
export class UpdatePostUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(input: UpdatePostInput): Promise<PostView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const updated = await this.blogService.updatePost(input, transactionContext);
      if (!updated) return null;
      return mapPostEntityToView(updated, 0);
    });
  }
}
