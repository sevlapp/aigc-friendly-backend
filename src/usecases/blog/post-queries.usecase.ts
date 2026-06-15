// src/usecases/blog/post-queries.usecase.ts

import { Injectable } from '@nestjs/common';
import { BlogQueryService } from '@src/modules/blog/queries/blog.query.service';
import type {
  ArchiveStats,
  BlogStats,
  CategoryTreeView,
  CategoryView,
  CommentQueryOptions,
  CommentView,
  ConfigView,
  LinkView,
  PostQueryOptions,
  PostView,
  TagView,
} from '@src/modules/blog/blog.types';

export interface GetPostsInput {
  options: PostQueryOptions;
}

export interface GetPostCommentsInput {
  postId: number;
}

export interface GetCommentsInput {
  options: CommentQueryOptions;
}

@Injectable()
export class GetPostsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(input: GetPostsInput): Promise<{ posts: PostView[]; total: number }> {
    return this.blogQueryService.getPosts(input.options);
  }
}

@Injectable()
export class GetPostBySlugUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(slug: string): Promise<PostView | null> {
    return this.blogQueryService.getPostBySlug(slug);
  }
}

@Injectable()
export class GetStickyPostsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<PostView[]> {
    return this.blogQueryService.getStickyPosts();
  }
}

@Injectable()
export class GetNextPostUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(currentId: number): Promise<PostView | null> {
    return this.blogQueryService.getNextPost(currentId);
  }
}

@Injectable()
export class GetPreviousPostUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(currentId: number): Promise<PostView | null> {
    return this.blogQueryService.getPreviousPost(currentId);
  }
}

@Injectable()
export class GetCategoriesUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<CategoryView[]> {
    return this.blogQueryService.getCategories();
  }
}

@Injectable()
export class GetCategoryBySlugUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(slug: string): Promise<CategoryView | null> {
    return this.blogQueryService.getCategoryBySlug(slug);
  }
}

@Injectable()
export class GetCategoryTreeUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<CategoryTreeView[]> {
    return this.blogQueryService.getCategoryTree();
  }
}

@Injectable()
export class GetTagsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<TagView[]> {
    return this.blogQueryService.getTags();
  }
}

@Injectable()
export class GetTagBySlugUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(slug: string): Promise<TagView | null> {
    return this.blogQueryService.getTagBySlug(slug);
  }
}

@Injectable()
export class GetPostCommentsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(input: GetPostCommentsInput): Promise<CommentView[]> {
    return this.blogQueryService.getPostComments(input.postId);
  }
}

@Injectable()
export class GetBlogStatsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<BlogStats> {
    return this.blogQueryService.getStats();
  }
}

@Injectable()
export class GetArchiveStatsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<ArchiveStats[]> {
    return this.blogQueryService.getArchiveStats();
  }
}

@Injectable()
export class GetLinksUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<LinkView[]> {
    return this.blogQueryService.getLinks();
  }
}

@Injectable()
export class GetConfigUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(): Promise<ConfigView[]> {
    return this.blogQueryService.getConfig();
  }
}

@Injectable()
export class GetCommentsUsecase {
  constructor(private readonly blogQueryService: BlogQueryService) {}

  async execute(input: GetCommentsInput): Promise<CommentView[]> {
    return this.blogQueryService.getComments(input.options);
  }
}
