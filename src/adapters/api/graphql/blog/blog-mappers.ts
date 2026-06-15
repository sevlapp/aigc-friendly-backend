// src/adapters/api/graphql/blog/blog-mappers.ts

import type {
  ArchiveStats,
  BlogStats,
  CategoryTreeView,
  CategoryView,
  CommentView,
  ConfigView,
  LinkView,
  PostView,
  TagView,
} from '@src/modules/blog/blog.types';
import { ArchiveStatsDTO, BlogStatsDTO, CommentDTO, ConfigDTO, LinkDTO } from './dto/comment.dto';
import { CategoryDTO, PostDTO, TagDTO } from './dto/post.dto';

export function mapPostViewToDTO(view: PostView): PostDTO {
  return {
    ...view,
    tags: view.tags.map(mapTagViewToDTO),
  };
}

export function mapTagViewToDTO(view: TagView): TagDTO {
  return { ...view };
}

export function mapCategoryViewToDTO(view: CategoryView): CategoryDTO {
  return { ...view };
}

export function mapCategoryTreeViewToDTO(
  view: CategoryView & { children: CategoryTreeView[] },
): CategoryDTO {
  return {
    ...view,
    children: view.children.map(mapCategoryTreeViewToDTO),
  };
}

export function mapCommentViewToDTO(view: CommentView): CommentDTO {
  return {
    ...view,
    replies: view.replies?.map(mapCommentViewToDTO),
  };
}

export function mapLinkViewToDTO(view: LinkView): LinkDTO {
  return { ...view };
}

export function mapConfigViewToDTO(view: ConfigView): ConfigDTO {
  return { ...view };
}

export function mapBlogStatsToDTO(stats: BlogStats): BlogStatsDTO {
  return { ...stats };
}

export function mapArchiveStatsToDTO(stats: ArchiveStats): ArchiveStatsDTO {
  return { ...stats };
}
