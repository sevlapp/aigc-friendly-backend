// src/modules/blog/entity-mappers.ts

import { PostEntity } from './entities/post.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { LinkEntity } from './entities/link.entity';
import { ConfigEntity } from './entities/config.entity';
import type {
  CategoryView,
  CommentView,
  ConfigView,
  LinkView,
  PostView,
  TagView,
} from './blog.types';

export function mapPostEntityToView(post: PostEntity, commentCount: number = 0): PostView {
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
    tags: (post.tags || []).map(mapTagEntityToView),
    commentCount,
  };
}

export function mapTagEntityToView(tag: TagEntity): TagView {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    postCount: tag.postCount,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  };
}

export function mapCategoryEntityToView(category: CategoryEntity): CategoryView {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive === 1,
    postCount: 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function mapCommentEntityToView(comment: CommentEntity): CommentView {
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    authorAvatar: comment.authorAvatar,
    content: comment.content,
    status: comment.status,
    likeCount: comment.likeCount,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function mapLinkEntityToView(link: LinkEntity): LinkView {
  return {
    id: link.id,
    name: link.name,
    url: link.url,
    description: link.description,
    avatar: link.avatar,
    sortOrder: link.sortOrder,
    isActive: link.isActive === 1,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}

export function mapConfigEntityToView(config: ConfigEntity): ConfigView {
  return {
    key: config.key,
    value: config.value,
    description: config.description,
  };
}

export function buildCommentTree(comments: CommentEntity[]): CommentView[] {
  const commentMap = new Map<number, CommentView>();
  const rootComments: CommentView[] = [];

  comments.forEach((comment) => {
    const view = mapCommentEntityToView(comment);
    commentMap.set(comment.id, view);

    if (!comment.parentId) {
      rootComments.push(view);
    }
  });

  comments.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(commentMap.get(comment.id)!);
      }
    }
  });

  return rootComments;
}