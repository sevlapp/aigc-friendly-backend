// src/usecases/blog/create-post.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CreatePostInput, PostView } from '@src/modules/blog/blog.types';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';

@Injectable()
export class CreatePostUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: CreatePostInput): Promise<PostView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      await this.blogService.createPost(input, transactionContext);
      return this.blogQueryService.getPostBySlug(input.slug);
    });
  }
}