// src/usecases/blog/category.usecases.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CategoryView, CreateCategoryInput, UpdateCategoryInput } from '@src/modules/blog/blog.types';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';

@Injectable()
export class CreateCategoryUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CategoryView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const category = await this.blogService.createCategory(input, transactionContext);
      return this.blogQueryService.getCategoryBySlug(category.slug);
    });
  }
}

@Injectable()
export class UpdateCategoryUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
    private readonly blogQueryService: BlogQueryService,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<CategoryView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const updated = await this.blogService.updateCategory(input, transactionContext);
      if (!updated) return null;
      return this.blogQueryService.getCategoryBySlug(updated.slug);
    });
  }
}

@Injectable()
export class DeleteCategoryUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(id: number): Promise<boolean> {
    return this.transactionRunner.run(async (transactionContext) => {
      return this.blogService.deleteCategory(id);
    });
  }
}