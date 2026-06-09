// src/usecases/blog/delete-comment.usecase.ts

import { Injectable } from '@nestjs/common';
import { BlogService } from '@src/modules/blog/services/blog.service';

@Injectable()
export class DeleteCommentUsecase {
  constructor(private readonly blogService: BlogService) {}

  async execute(id: number): Promise<boolean> {
    return this.blogService.deleteComment(id);
  }
}