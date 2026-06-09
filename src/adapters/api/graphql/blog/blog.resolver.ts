// src/adapters/api/graphql/blog/blog.resolver.ts

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValidateInput } from '@src/adapters/api/graphql/common/validate-input.decorator';
import { CreatePostUsecase } from '@src/usecases/blog/create-post.usecase';
import { UpdatePostUsecase } from '@src/usecases/blog/update-post.usecase';
import { DeletePostUsecase } from '@src/usecases/blog/delete-post.usecase';
import { CreateCommentUsecase } from '@src/usecases/blog/create-comment.usecase';
import { UpdateCommentUsecase } from '@src/usecases/blog/update-comment.usecase';
import { ApproveCommentUsecase } from '@src/usecases/blog/approve-comment.usecase';
import { CreateCategoryUsecase, UpdateCategoryUsecase, DeleteCategoryUsecase } from '@src/usecases/blog/category.usecases';
import { CreateTagUsecase, UpdateTagUsecase, DeleteTagUsecase } from '@src/usecases/blog/tag.usecases';
import { CreateLinkUsecase, UpdateLinkUsecase, DeleteLinkUsecase } from '@src/usecases/blog/link.usecases';
import { UpdateConfigUsecase } from '@src/usecases/blog/config.usecase';
import { GetPostByIdUsecase } from '@src/usecases/blog/get-post.usecase';
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
} from '@src/usecases/blog/post-queries.usecase';
import { ArchiveStatsDTO, BlogStatsDTO, CommentDTO, ConfigDTO, LinkDTO, PostListResult } from './dto/comment.dto';
import { CategoryDTO, PostDTO, TagDTO } from './dto/post.dto';
import { CreatePostInput, UpdatePostInput } from './dto/post.input';
import { CreateCommentInput, UpdateCommentInput, CreateCategoryInput, UpdateCategoryInput } from './dto/comment.input';
import { CreateTagInput, UpdateTagInput, CreateLinkInput, UpdateLinkInput } from './dto/tag.input';
import { PostByIdArgs, PostBySlugArgs, PostQueryArgs, CommentQueryArgs, UpdateConfigInput } from './dto/query.input';
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

@Resolver()
export class BlogResolver {
  constructor(
    private readonly getPostByIdUsecase: GetPostByIdUsecase,
    private readonly getPostsUsecase: GetPostsUsecase,
    private readonly getPostBySlugUsecase: GetPostBySlugUsecase,
    private readonly getStickyPostsUsecase: GetStickyPostsUsecase,
    private readonly getNextPostUsecase: GetNextPostUsecase,
    private readonly getPreviousPostUsecase: GetPreviousPostUsecase,
    private readonly getCategoriesUsecase: GetCategoriesUsecase,
    private readonly getCategoryBySlugUsecase: GetCategoryBySlugUsecase,
    private readonly getTagsUsecase: GetTagsUsecase,
    private readonly getTagBySlugUsecase: GetTagBySlugUsecase,
    private readonly getPostCommentsUsecase: GetPostCommentsUsecase,
    private readonly getBlogStatsUsecase: GetBlogStatsUsecase,
    private readonly getArchiveStatsUsecase: GetArchiveStatsUsecase,
    private readonly getLinksUsecase: GetLinksUsecase,
    private readonly getConfigUsecase: GetConfigUsecase,
    private readonly createPostUsecase: CreatePostUsecase,
    private readonly updatePostUsecase: UpdatePostUsecase,
    private readonly deletePostUsecase: DeletePostUsecase,
    private readonly createCommentUsecase: CreateCommentUsecase,
    private readonly updateCommentUsecase: UpdateCommentUsecase,
    private readonly approveCommentUsecase: ApproveCommentUsecase,
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

  @Query(() => PostDTO, { nullable: true })
  async post(@Args() args: PostByIdArgs): Promise<PostDTO | null> {
    const post = await this.getPostByIdUsecase.execute({ id: args.id });
    return post ? mapPostViewToDTO(post) : null;
  }

  @Query(() => PostDTO, { nullable: true })
  async postBySlug(@Args() args: PostBySlugArgs): Promise<PostDTO | null> {
    const post = await this.getPostBySlugUsecase.execute(args.slug);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Query(() => PostListResult)
  async posts(@Args() args: PostQueryArgs): Promise<PostListResult> {
    const { posts, total } = await this.getPostsUsecase.execute({ options: args });
    return {
      posts: posts.map(mapPostViewToDTO),
      total,
      page: args.page || 1,
      pageSize: args.pageSize || 10,
    };
  }

  @Query(() => [PostDTO])
  async stickyPosts(): Promise<PostDTO[]> {
    const posts = await this.getStickyPostsUsecase.execute();
    return posts.map(mapPostViewToDTO);
  }

  @Query(() => PostDTO, { nullable: true })
  async nextPost(@Args('currentId') currentId: number): Promise<PostDTO | null> {
    const post = await this.getNextPostUsecase.execute(currentId);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Query(() => PostDTO, { nullable: true })
  async previousPost(@Args('currentId') currentId: number): Promise<PostDTO | null> {
    const post = await this.getPreviousPostUsecase.execute(currentId);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Query(() => [CategoryDTO])
  async categories(): Promise<CategoryDTO[]> {
    const categories = await this.getCategoriesUsecase.execute();
    return categories.map(mapCategoryViewToDTO);
  }

  @Query(() => CategoryDTO, { nullable: true })
  async category(@Args('slug') slug: string): Promise<CategoryDTO | null> {
    const category = await this.getCategoryBySlugUsecase.execute(slug);
    return category ? mapCategoryViewToDTO(category) : null;
  }

  @Query(() => [TagDTO])
  async tags(): Promise<TagDTO[]> {
    const tags = await this.getTagsUsecase.execute();
    return tags.map((tag) => ({ ...tag }));
  }

  @Query(() => TagDTO, { nullable: true })
  async tag(@Args('slug') slug: string): Promise<TagDTO | null> {
    const tag = await this.getTagBySlugUsecase.execute(slug);
    return tag ? ({ ...tag }) : null;
  }

  @Query(() => [CommentDTO])
  async postComments(@Args('postId') postId: number): Promise<CommentDTO[]> {
    const comments = await this.getPostCommentsUsecase.execute({ postId });
    return comments.map(mapCommentViewToDTO);
  }

  @Query(() => BlogStatsDTO)
  async blogStats(): Promise<BlogStatsDTO> {
    const stats = await this.getBlogStatsUsecase.execute();
    return mapBlogStatsToDTO(stats);
  }

  @Query(() => [ArchiveStatsDTO])
  async archiveStats(): Promise<ArchiveStatsDTO[]> {
    const stats = await this.getArchiveStatsUsecase.execute();
    return stats.map(mapArchiveStatsToDTO);
  }

  @Query(() => [LinkDTO])
  async links(): Promise<LinkDTO[]> {
    const links = await this.getLinksUsecase.execute();
    return links.map(mapLinkViewToDTO);
  }

  @Query(() => [ConfigDTO])
  async config(): Promise<ConfigDTO[]> {
    const configs = await this.getConfigUsecase.execute();
    return configs.map(mapConfigViewToDTO);
  }

  @Mutation(() => PostDTO, { nullable: true })
  @ValidateInput()
  async createPost(@Args('input') input: CreatePostInput): Promise<PostDTO | null> {
    const post = await this.createPostUsecase.execute(input);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Mutation(() => PostDTO, { nullable: true })
  @ValidateInput()
  async updatePost(@Args('input') input: UpdatePostInput): Promise<PostDTO | null> {
    const post = await this.updatePostUsecase.execute(input);
    return post ? mapPostViewToDTO(post) : null;
  }

  @Mutation(() => Boolean)
  async deletePost(@Args('id') id: number): Promise<boolean> {
    return this.deletePostUsecase.execute(id);
  }

  @Mutation(() => CommentDTO, { nullable: true })
  @ValidateInput()
  async createComment(@Args('input') input: CreateCommentInput): Promise<CommentDTO | null> {
    const comment = await this.createCommentUsecase.execute(input);
    return comment ? mapCommentViewToDTO(comment) : null;
  }

  @Mutation(() => CommentDTO, { nullable: true })
  @ValidateInput()
  async updateComment(@Args('input') input: UpdateCommentInput): Promise<CommentDTO | null> {
    const comment = await this.updateCommentUsecase.execute(input);
    return comment ? mapCommentViewToDTO(comment) : null;
  }

  @Mutation(() => Boolean)
  async approveComment(@Args('id') id: number): Promise<boolean> {
    return this.approveCommentUsecase.execute(id);
  }

  @Mutation(() => CategoryDTO, { nullable: true })
  @ValidateInput()
  async createCategory(@Args('input') input: CreateCategoryInput): Promise<CategoryDTO | null> {
    const category = await this.createCategoryUsecase.execute(input);
    return category ? mapCategoryViewToDTO(category) : null;
  }

  @Mutation(() => CategoryDTO, { nullable: true })
  @ValidateInput()
  async updateCategory(@Args('input') input: UpdateCategoryInput): Promise<CategoryDTO | null> {
    const category = await this.updateCategoryUsecase.execute(input);
    return category ? mapCategoryViewToDTO(category) : null;
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Args('id') id: number): Promise<boolean> {
    return this.deleteCategoryUsecase.execute(id);
  }

  @Mutation(() => TagDTO, { nullable: true })
  @ValidateInput()
  async createTag(@Args('input') input: CreateTagInput): Promise<TagDTO | null> {
    const tag = await this.createTagUsecase.execute(input);
    return tag ? ({ ...tag }) : null;
  }

  @Mutation(() => TagDTO, { nullable: true })
  @ValidateInput()
  async updateTag(@Args('input') input: UpdateTagInput): Promise<TagDTO | null> {
    const tag = await this.updateTagUsecase.execute(input);
    return tag ? ({ ...tag }) : null;
  }

  @Mutation(() => Boolean)
  async deleteTag(@Args('id') id: number): Promise<boolean> {
    return this.deleteTagUsecase.execute(id);
  }

  @Mutation(() => LinkDTO, { nullable: true })
  @ValidateInput()
  async createLink(@Args('input') input: CreateLinkInput): Promise<LinkDTO | null> {
    const link = await this.createLinkUsecase.execute(input);
    return link ? mapLinkViewToDTO(link) : null;
  }

  @Mutation(() => LinkDTO, { nullable: true })
  @ValidateInput()
  async updateLink(@Args('input') input: UpdateLinkInput): Promise<LinkDTO | null> {
    const link = await this.updateLinkUsecase.execute(input);
    return link ? mapLinkViewToDTO(link) : null;
  }

  @Mutation(() => Boolean)
  async deleteLink(@Args('id') id: number): Promise<boolean> {
    return this.deleteLinkUsecase.execute(id);
  }

  @Mutation(() => ConfigDTO, { nullable: true })
  @ValidateInput()
  async updateConfig(@Args('input') input: UpdateConfigInput): Promise<ConfigDTO | null> {
    const config = await this.updateConfigUsecase.execute(input);
    return config ? mapConfigViewToDTO(config) : null;
  }
}