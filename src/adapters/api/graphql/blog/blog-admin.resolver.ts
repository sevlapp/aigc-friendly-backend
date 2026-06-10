// src/adapters/api/graphql/blog/blog-admin.resolver.ts

import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ValidateInput } from '@src/adapters/api/graphql/common/validate-input.decorator';
import { JwtAuthGuard } from '@src/adapters/api/graphql/guards/jwt-auth.guard';
import { CreatePostUsecase } from '@src/usecases/blog/create-post.usecase';
import { UpdatePostUsecase } from '@src/usecases/blog/update-post.usecase';
import { DeletePostUsecase } from '@src/usecases/blog/delete-post.usecase';
import { UpdateCommentUsecase } from '@src/usecases/blog/update-comment.usecase';
import { ApproveCommentUsecase } from '@src/usecases/blog/approve-comment.usecase';
import { RejectCommentUsecase } from '@src/usecases/blog/reject-comment.usecase';
import { DeleteCommentUsecase } from '@src/usecases/blog/delete-comment.usecase';
import { CreateCategoryUsecase, UpdateCategoryUsecase, DeleteCategoryUsecase } from '@src/usecases/blog/category.usecases';
import { CreateTagUsecase, UpdateTagUsecase, DeleteTagUsecase } from '@src/usecases/blog/tag.usecases';
import { CreateLinkUsecase, UpdateLinkUsecase, DeleteLinkUsecase } from '@src/usecases/blog/link.usecases';
import { UpdateConfigUsecase } from '@src/usecases/blog/config.usecase';
import { GetPostByIdUsecase } from '@src/usecases/blog/get-post.usecase';
import {
  GetPostsUsecase,
  GetCategoriesUsecase,
  GetTagsUsecase,
  GetLinksUsecase,
  GetConfigUsecase,
  GetBlogStatsUsecase,
  GetArchiveStatsUsecase,
  GetCommentsUsecase,
} from '@src/usecases/blog/post-queries.usecase';
import {
  ArchiveStatsDTO,
  BlogStatsDTO,
  CommentDTO,
  ConfigDTO,
  LinkDTO,
  PostListResult,
} from './dto/comment.dto';
import { CategoryDTO, PostDTO, TagDTO } from './dto/post.dto';
import { CreatePostInput, UpdatePostInput } from './dto/post.input';
import { UpdateCommentInput, CreateCategoryInput, UpdateCategoryInput } from './dto/comment.input';
import { CreateTagInput, UpdateTagInput, CreateLinkInput, UpdateLinkInput } from './dto/tag.input';
import { PostQueryArgs, CommentQueryArgs, UpdateConfigInput } from './dto/query.input';
import type {
  ArchiveStats,
  BlogStats,
  CategoryView,
  CommentView,
  ConfigView,
  LinkView,
  PostView,
  TagView,
} from '@src/modules/blog/blog.types';

function mapPostViewToDTO(view: PostView): PostDTO {
  return {
    ...view,
    tags: view.tags.map(mapTagViewToDTO),
  };
}

function mapTagViewToDTO(view: TagView): TagDTO {
  return { ...view };
}

function mapCategoryViewToDTO(view: CategoryView): CategoryDTO {
  return { ...view };
}

function mapCommentViewToDTO(view: CommentView): CommentDTO {
  return {
    ...view,
    replies: view.replies?.map(mapCommentViewToDTO),
  };
}

function mapLinkViewToDTO(view: LinkView): LinkDTO {
  return { ...view };
}

function mapConfigViewToDTO(view: ConfigView): ConfigDTO {
  return { ...view };
}

function mapBlogStatsToDTO(stats: BlogStats): BlogStatsDTO {
  return { ...stats };
}

function mapArchiveStatsToDTO(stats: ArchiveStats): ArchiveStatsDTO {
  return { ...stats };
}

/**
 * 博客管理端 Resolver
 * 所有需要管理员权限的操作都在这里
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class BlogAdminResolver {
  constructor(
    private readonly getPostsUsecase: GetPostsUsecase,
    private readonly getPostByIdUsecase: GetPostByIdUsecase,
    private readonly getCommentsUsecase: GetCommentsUsecase,
    private readonly getCategoriesUsecase: GetCategoriesUsecase,
    private readonly getTagsUsecase: GetTagsUsecase,
    private readonly getLinksUsecase: GetLinksUsecase,
    private readonly getConfigUsecase: GetConfigUsecase,
    private readonly getBlogStatsUsecase: GetBlogStatsUsecase,
    private readonly getArchiveStatsUsecase: GetArchiveStatsUsecase,
    private readonly createPostUsecase: CreatePostUsecase,
    private readonly updatePostUsecase: UpdatePostUsecase,
    private readonly deletePostUsecase: DeletePostUsecase,
    private readonly updateCommentUsecase: UpdateCommentUsecase,
    private readonly approveCommentUsecase: ApproveCommentUsecase,
    private readonly rejectCommentUsecase: RejectCommentUsecase,
    private readonly deleteCommentUsecase: DeleteCommentUsecase,
    private readonly createCategoryUsecase: CreateCategoryUsecase,
    private readonly updateCategoryUsecase: UpdateCategoryUsecase,
    private readonly deleteCategoryUsecase: DeleteCategoryUsecase,
    private readonly createTagUsecase: CreateTagUsecase,
    private readonly updateTagUsecase: UpdateTagUsecase,
    private readonly deleteTagUsecase: DeleteTagUsecase,
    private readonly createLinkUsecase: CreateLinkUsecase,
    private readonly updateLinkUsecase: UpdateLinkUsecase,
    private readonly deleteLinkUsecase: DeleteLinkUsecase,
    private readonly updateConfigUsecase: UpdateConfigUsecase,
  ) {}

  // ==================== 文章管理 ====================

  @Query(() => PostListResult)
  async adminPosts(@Args() args: PostQueryArgs): Promise<PostListResult> {
    const { posts, total } = await this.getPostsUsecase.execute({ options: args });
    return {
      posts: posts.map(mapPostViewToDTO),
      total,
      page: args.page || 1,
      pageSize: args.pageSize || 10,
    };
  }

  @Query(() => PostDTO, { nullable: true })
  async adminPost(@Args('id') id: number): Promise<PostDTO | null> {
    const post = await this.getPostByIdUsecase.execute({ id });
    return post ? mapPostViewToDTO(post) : null;
  }

  @Mutation(() => PostDTO, { nullable: true })
  @ValidateInput()
  async adminCreatePost(@Args('input') input: CreatePostInput): Promise<PostDTO | null> {
    const post = await this.createPostUsecase.execute(input);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Mutation(() => PostDTO, { nullable: true })
  @ValidateInput()
  async adminUpdatePost(@Args('input') input: UpdatePostInput): Promise<PostDTO | null> {
    const post = await this.updatePostUsecase.execute(input);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Mutation(() => Boolean)
  async adminDeletePost(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.deletePostUsecase.execute(id);
  }

  // ==================== 评论管理 ====================

  @Query(() => [CommentDTO])
  async adminComments(@Args() args: CommentQueryArgs): Promise<CommentDTO[]> {
    const comments = await this.getCommentsUsecase.execute({ options: args });
    return comments.map(mapCommentViewToDTO);
  }

  @Mutation(() => CommentDTO, { nullable: true })
  @ValidateInput()
  async adminUpdateComment(@Args('input') input: UpdateCommentInput): Promise<CommentDTO | null> {
    const comment = await this.updateCommentUsecase.execute(input);
    return comment ? mapCommentViewToDTO(comment) : null;
  }

  @Mutation(() => Boolean)
  async adminApproveComment(@Args('id') id: number): Promise<boolean> {
    return this.approveCommentUsecase.execute(id);
  }

  @Mutation(() => Boolean)
  async adminRejectComment(@Args('id') id: number): Promise<boolean> {
    return this.rejectCommentUsecase.execute(id);
  }

  @Mutation(() => Boolean)
  async adminDeleteComment(@Args('id') id: number): Promise<boolean> {
    return this.deleteCommentUsecase.execute(id);
  }

  // ==================== 分类管理 ====================

  @Query(() => [CategoryDTO])
  async adminCategories(): Promise<CategoryDTO[]> {
    const categories = await this.getCategoriesUsecase.execute();
    return categories.map(mapCategoryViewToDTO);
  }

  @Mutation(() => CategoryDTO, { nullable: true })
  @ValidateInput()
  async adminCreateCategory(@Args('input') input: CreateCategoryInput): Promise<CategoryDTO | null> {
    const category = await this.createCategoryUsecase.execute(input);
    return category ? mapCategoryViewToDTO(category) : null;
  }

  @Mutation(() => CategoryDTO, { nullable: true })
  @ValidateInput()
  async adminUpdateCategory(@Args('input') input: UpdateCategoryInput): Promise<CategoryDTO | null> {
    const category = await this.updateCategoryUsecase.execute(input);
    return category ? mapCategoryViewToDTO(category) : null;
  }

  @Mutation(() => Boolean)
  async adminDeleteCategory(@Args('id') id: number): Promise<boolean> {
    return this.deleteCategoryUsecase.execute(id);
  }

  // ==================== 标签管理 ====================

  @Query(() => [TagDTO])
  async adminTags(): Promise<TagDTO[]> {
    const tags = await this.getTagsUsecase.execute();
    return tags.map(mapTagViewToDTO);
  }

  @Mutation(() => TagDTO, { nullable: true })
  @ValidateInput()
  async adminCreateTag(@Args('input') input: CreateTagInput): Promise<TagDTO | null> {
    const tag = await this.createTagUsecase.execute(input);
    return tag ? mapTagViewToDTO(tag) : null;
  }

  @Mutation(() => TagDTO, { nullable: true })
  @ValidateInput()
  async adminUpdateTag(@Args('input') input: UpdateTagInput): Promise<TagDTO | null> {
    const tag = await this.updateTagUsecase.execute(input);
    return tag ? mapTagViewToDTO(tag) : null;
  }

  @Mutation(() => Boolean)
  async adminDeleteTag(@Args('id') id: number): Promise<boolean> {
    return this.deleteTagUsecase.execute(id);
  }

  // ==================== 链接管理 ====================

  @Query(() => [LinkDTO])
  async adminLinks(): Promise<LinkDTO[]> {
    const links = await this.getLinksUsecase.execute();
    return links.map(mapLinkViewToDTO);
  }

  @Mutation(() => LinkDTO, { nullable: true })
  @ValidateInput()
  async adminCreateLink(@Args('input') input: CreateLinkInput): Promise<LinkDTO | null> {
    const link = await this.createLinkUsecase.execute(input);
    return link ? mapLinkViewToDTO(link) : null;
  }

  @Mutation(() => LinkDTO, { nullable: true })
  @ValidateInput()
  async adminUpdateLink(@Args('input') input: UpdateLinkInput): Promise<LinkDTO | null> {
    const link = await this.updateLinkUsecase.execute(input);
    return link ? mapLinkViewToDTO(link) : null;
  }

  @Mutation(() => Boolean)
  async adminDeleteLink(@Args('id') id: number): Promise<boolean> {
    return this.deleteLinkUsecase.execute(id);
  }

  // ==================== 配置管理 ====================

  @Query(() => [ConfigDTO])
  async adminConfig(): Promise<ConfigDTO[]> {
    const configs = await this.getConfigUsecase.execute();
    return configs.map(mapConfigViewToDTO);
  }

  @Mutation(() => ConfigDTO, { nullable: true })
  @ValidateInput()
  async adminUpdateConfig(@Args('input') input: UpdateConfigInput): Promise<ConfigDTO | null> {
    const config = await this.updateConfigUsecase.execute(input);
    return config ? mapConfigViewToDTO(config) : null;
  }

  // ==================== 统计信息 ====================

  @Query(() => BlogStatsDTO)
  async adminBlogStats(): Promise<BlogStatsDTO> {
    const stats = await this.getBlogStatsUsecase.execute();
    return mapBlogStatsToDTO(stats);
  }

  @Query(() => [ArchiveStatsDTO])
  async adminArchiveStats(): Promise<ArchiveStatsDTO[]> {
    const stats = await this.getArchiveStatsUsecase.execute();
    return stats.map(mapArchiveStatsToDTO);
  }
}