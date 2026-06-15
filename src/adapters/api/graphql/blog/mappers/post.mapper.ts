// src/adapters/api/graphql/blog/mappers/post.mapper.ts

import type {
  ArchiveStats,
  BlogStats,
  CategoryView,
  CommentView,
  ConfigView,
  LinkView,
  PostView,
  TagView,
  CategoryTreeView,
} from '@src/modules/blog/blog.types';
import { PostDTO, TagDTO, CategoryDTO } from '../dto/post.dto';
import { CommentDTO as PublicCommentDTO } from '../dto/comment.dto';
import { LinkDTO, ConfigDTO, BlogStatsDTO, ArchiveStatsDTO } from '../dto/comment.dto';

/**
 * Post View -> PostDTO 映射
 */
export function mapPostViewToDTO(view: PostView): PostDTO {
  return {
    ...view,
    tags: view.tags.map(mapTagViewToDTO),
  };
}

/**
 * Tag View -> TagDTO 映射
 */
export function mapTagViewToDTO(view: TagView): TagDTO {
  return { ...view };
}

/**
 * Category View -> CategoryDTO 映射
 */
export function mapCategoryViewToDTO(view: CategoryView): CategoryDTO {
  return { ...view };
}

/**
 * Category Tree View -> CategoryDTO 映射
 */
export function mapCategoryTreeViewToDTO(view: CategoryTreeView): CategoryDTO {
  return {
    ...view,
    children: view.children.map(mapCategoryTreeViewToDTO),
  };
}

/**
 * Comment View -> CommentDTO 映射
 */
export function mapCommentViewToDTO(view: CommentView): PublicCommentDTO {
  return {
    ...view,
    replies: view.replies?.map(mapCommentViewToDTO),
  };
}

/**
 * Link View -> LinkDTO 映射
 */
export function mapLinkViewToDTO(view: LinkView): LinkDTO {
  return { ...view };
}

/**
 * Config View -> ConfigDTO 映射
 */
export function mapConfigViewToDTO(view: ConfigView): ConfigDTO {
  return { ...view };
}

/**
 * BlogStats -> BlogStatsDTO 映射
 */
export function mapBlogStatsToDTO(stats: BlogStats): BlogStatsDTO {
  return { ...stats };
}

/**
 * ArchiveStats -> ArchiveStatsDTO 映射
 */
export function mapArchiveStatsToDTO(stats: ArchiveStats): ArchiveStatsDTO {
  return { ...stats };
}
