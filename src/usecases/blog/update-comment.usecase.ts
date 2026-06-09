// src/usecases/blog/update-comment.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CommentView, UpdateCommentInput } from '@src/modules/blog/blog.types';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';

@Injectable()
export class UpdateCommentUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: UpdateCommentInput): Promise<CommentView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const updated = await this.blogService.updateComment(input, transactionContext);
      if (!updated) return null;
      const comments = await this.blogQueryService.getComments({ page: 1, pageSize: 1 });
      return comments.find((c: { id: number }) => c.id === input.id) || null;
    });
  }
}