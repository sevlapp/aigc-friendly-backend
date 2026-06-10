// src/usecases/blog/reject-comment.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';

@Injectable()
export class RejectCommentUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(id: number): Promise<boolean> {
    return this.transactionRunner.run(async (transactionContext) => {
      return this.blogService.rejectComment(id);
    });
  }
}
