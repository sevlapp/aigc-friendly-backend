// src/usecases/blog/blog-usecases.module.ts

import { Module } from '@nestjs/common';
import { BlogModule } from '@src/modules/blog/blog.module';
import { CreatePostUsecase } from './create-post.usecase';
import { UpdatePostUsecase } from './update-post.usecase';
import { DeletePostUsecase } from './delete-post.usecase';
import { CreateCommentUsecase } from './create-comment.usecase';
import { UpdateCommentUsecase } from './update-comment.usecase';
import { ApproveCommentUsecase } from './approve-comment.usecase';
import { DeleteCommentUsecase } from './delete-comment.usecase';
import { CreateCategoryUsecase, UpdateCategoryUsecase, DeleteCategoryUsecase } from './category.usecases';
import { CreateTagUsecase, UpdateTagUsecase, DeleteTagUsecase } from './tag.usecases';
import { CreateLinkUsecase, UpdateLinkUsecase, DeleteLinkUsecase } from './link.usecases';
import { UpdateConfigUsecase } from './config.usecase';
import { GetPostByIdUsecase } from './get-post.usecase';
import {
  GetPostsUsecase,
  GetPostBySlugUsecase,
  GetStickyPostsUsecase,
  GetNextPostUsecase,
  GetPreviousPostUsecase,
  GetCategoriesUsecase,
  GetCategoryBySlugUsecase,
  GetTagsUsecase,
  GetTagBySlugUsecase,
  GetPostCommentsUsecase,
  GetBlogStatsUsecase,
  GetArchiveStatsUsecase,
  GetLinksUsecase,
  GetConfigUsecase,
  GetCommentsUsecase,
} from './post-queries.usecase';

@Module({
  imports: [BlogModule],
  providers: [
    CreatePostUsecase,
    UpdatePostUsecase,
    DeletePostUsecase,
    CreateCommentUsecase,
    UpdateCommentUsecase,
    ApproveCommentUsecase,
    CreateCategoryUsecase,
    UpdateCategoryUsecase,
    DeleteCategoryUsecase,
    CreateTagUsecase,
    UpdateTagUsecase,
    DeleteTagUsecase,
    CreateLinkUsecase,
    UpdateLinkUsecase,
    DeleteLinkUsecase,
    UpdateConfigUsecase,
    DeleteCommentUsecase,
    GetPostByIdUsecase,
    GetPostsUsecase,
    GetPostBySlugUsecase,
    GetStickyPostsUsecase,
    GetNextPostUsecase,
    GetPreviousPostUsecase,
    GetCategoriesUsecase,
    GetCategoryBySlugUsecase,
    GetTagsUsecase,
    GetTagBySlugUsecase,
    GetPostCommentsUsecase,
    GetBlogStatsUsecase,
    GetArchiveStatsUsecase,
    GetLinksUsecase,
    GetConfigUsecase,
    GetCommentsUsecase,
  ],
  exports: [
    CreatePostUsecase,
    UpdatePostUsecase,
    DeletePostUsecase,
    CreateCommentUsecase,
    UpdateCommentUsecase,
    ApproveCommentUsecase,
    CreateCategoryUsecase,
    UpdateCategoryUsecase,
    DeleteCategoryUsecase,
    CreateTagUsecase,
    UpdateTagUsecase,
    DeleteTagUsecase,
    CreateLinkUsecase,
    UpdateLinkUsecase,
    DeleteLinkUsecase,
    UpdateConfigUsecase,
    DeleteCommentUsecase,
    GetPostByIdUsecase,
    GetPostsUsecase,
    GetPostBySlugUsecase,
    GetStickyPostsUsecase,
    GetNextPostUsecase,
    GetPreviousPostUsecase,
    GetCategoriesUsecase,
    GetCategoryBySlugUsecase,
    GetTagsUsecase,
    GetTagBySlugUsecase,
    GetPostCommentsUsecase,
    GetBlogStatsUsecase,
    GetArchiveStatsUsecase,
    GetLinksUsecase,
    GetConfigUsecase,
    GetCommentsUsecase,
  ],
})
export class BlogUsecasesModule {}