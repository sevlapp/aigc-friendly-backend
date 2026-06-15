// src/usecases/blog/create-post.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CreatePostInput, PostView } from '@src/modules/blog/blog.types';
import { mapPostEntityToView } from '@src/modules/blog/entity-mappers';

@Injectable()
export class CreatePostUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(input: CreatePostInput): Promise<PostView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const createdPost = await this.blogService.createPost(input, transactionContext);
      return mapPostEntityToView(createdPost, 0);
    });
  }
}
