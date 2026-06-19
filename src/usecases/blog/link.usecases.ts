// src/usecases/blog/link.usecases.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import type { CreateLinkInput, LinkView, UpdateLinkInput } from '@src/modules/blog/blog.types';

@Injectable()
export class CreateLinkUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(input: CreateLinkInput): Promise<LinkView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const link = await this.blogService.createLink(input, transactionContext);
      return {
        ...link,
        isActive: link.isActive === 1,
      };
    });
  }
}

@Injectable()
export class UpdateLinkUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(input: UpdateLinkInput): Promise<LinkView | null> {
    return this.transactionRunner.run(async (transactionContext) => {
      const updated = await this.blogService.updateLink(input, transactionContext);
      if (!updated) return null;
      return {
        ...updated,
        isActive: updated.isActive === 1,
      };
    });
  }
}

@Injectable()
export class DeleteLinkUsecase {
  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
    private readonly blogService: BlogService,
  ) {}

  async execute(id: number): Promise<boolean> {
    return this.transactionRunner.run(async () => {
      return this.blogService.deleteLink(id);
    });
  }
}
