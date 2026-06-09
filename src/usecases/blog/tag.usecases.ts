// src/usecases/blog/tag.usecases.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CreateTagInput, TagView, UpdateTagInput } from '@src/modules/blog/blog.types';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';

@Injectable()
export class CreateTagUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: CreateTagInput): Promise<TagView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const tag = await this.blogService.createTag(input, transactionContext);
      return this.blogQueryService.getTagBySlug(tag.slug);
    });
  }
}

@Injectable()
export class UpdateTagUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: UpdateTagInput): Promise<TagView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const updated = await this.blogService.updateTag(input, transactionContext);
      if (!updated) return null;
      return this.blogQueryService.getTagBySlug(updated.slug);
    });
  }
}

@Injectable()
export class DeleteTagUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(id: number): Promise<boolean> {
    return this.transactionRunner.run(async () => {
      return this.blogService.deleteTag(id);
    });
  }
}