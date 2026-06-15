// src/usecases/blog/create-post.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_RUNNER,
  type TransactionRunner,
} from '@src/usecases/common/ports/transaction-runner.contract';
import { BlogService } from '@src/modules/blog/services/blog.service';
import { PostEntity } from '@src/modules/blog/entities/post.entity';
import type { CreatePostInput, PostView } from '@src/modules/blog/blog.types';

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
      return this.mapPostEntityToView(createdPost);
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
