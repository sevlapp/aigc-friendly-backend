// src/usecases/blog/update-post.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import { PostEntity } from '@src/modules/blog/entities/post.entity';
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
      return this.mapPostEntityToView(updated);
    });
  }

  private mapPostEntityToView(post: PostEntity): PostView {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      status: post.status,
      visibility: post.visibility,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      isSticky: post.isSticky === 1,
      categoryId: post.categoryId,
      categoryName: undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      tags: (post.tags || []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        postCount: tag.postCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })),
      commentCount: 0,
    };
  }
}