// src/modules/blog/blog.types.ts

import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { PostStatus, PostVisibility, CommentStatus } from '@app-types/models/blog.types';

export type PostStatusType = PostStatus;
export type PostVisibilityType = PostVisibility;
export type CommentStatusType = CommentStatus;

export interface PostView {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly coverImage?: string;
  readonly status: PostStatusType;
  readonly visibility: PostVisibilityType;
  readonly viewCount: number;
  readonly likeCount: number;
  readonly isSticky: boolean;
  readonly categoryId?: number;
  readonly categoryName?: string;
  readonly tags: TagView[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt?: Date;
  readonly commentCount: number;
}

export interface CategoryView {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly parentId?: number;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly postCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CategoryTreeView extends CategoryView {
  readonly children: CategoryTreeView[];
}

export interface TagView {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly postCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CommentView {
  readonly id: number;
  readonly postId: number;
  readonly parentId?: number;
  readonly authorName: string;
  readonly authorEmail?: string;
  readonly authorAvatar?: string;
  readonly content: string;
  readonly status: CommentStatusType;
  readonly likeCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  replies?: CommentView[];
}

export interface LinkView {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly avatar?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ConfigView {
  readonly key: string;
  readonly value?: string;
  readonly description?: string;
}

export interface CreatePostInput {
  readonly title: string;
  readonly slug: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly coverImage?: string;
  readonly status: PostStatusType;
  readonly visibility: PostVisibilityType;
  readonly isSticky: boolean;
  readonly categoryId?: number;
  readonly tagIds?: number[];
}

export interface UpdatePostInput {
  readonly id: number;
  readonly title?: string;
  readonly slug?: string;
  readonly excerpt?: string;
  readonly content?: string;
  readonly coverImage?: string;
  readonly status?: PostStatusType;
  readonly visibility?: PostVisibilityType;
  readonly isSticky?: boolean;
  readonly categoryId?: number;
  readonly tagIds?: number[];
}

export interface CreateCategoryInput {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly parentId?: number;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface UpdateCategoryInput {
  readonly id: number;
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string;
  readonly parentId?: number;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface CreateTagInput {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
}

export interface UpdateTagInput {
  readonly id: number;
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string;
}

export interface CreateCommentInput {
  readonly postId: number;
  readonly parentId?: number;
  readonly authorName: string;
  readonly authorEmail?: string;
  readonly content: string;
}

export interface UpdateCommentInput {
  readonly id: number;
  readonly content?: string;
  readonly status?: CommentStatusType;
}

export interface CreateLinkInput {
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly avatar?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface UpdateLinkInput {
  readonly id: number;
  readonly name?: string;
  readonly url?: string;
  readonly description?: string;
  readonly avatar?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface UpdateConfigInput {
  readonly key: string;
  readonly value?: string;
  readonly description?: string;
}

export interface PostQueryOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly categoryId?: number;
  readonly tagId?: number;
  readonly status?: PostStatusType;
  readonly search?: string;
  readonly sortBy?: string;
  readonly sortOrder?: 'ASC' | 'DESC';
}

export interface CommentQueryOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly postId?: number;
  readonly status?: CommentStatusType;
}

export interface ArchiveStats {
  readonly year: number;
  readonly month: number;
  readonly count: number;
}

export interface BlogStats {
  readonly totalPosts: number;
  readonly totalComments: number;
  readonly totalViews: number;
  readonly totalLikes: number;
  readonly publishedPosts: number;
  readonly pendingComments: number;
}
