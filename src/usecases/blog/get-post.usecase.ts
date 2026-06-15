// src/usecases/blog/get-post.usecase.ts

import { Injectable } from '@nestjs/common';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';
import type { PostView } from '@src/modules/blog/blog.types';

export interface GetPostByIdInput {
  id: number;
}

@Injectable()
export class GetPostByIdUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(input: GetPostByIdInput): Promise<PostView | null> {
    return this.blogQueryService.getPostById(input.id);
  }
}
