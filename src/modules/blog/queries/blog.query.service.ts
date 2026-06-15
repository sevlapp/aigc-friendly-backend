// src/modules/blog/queries/blog.query.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity, PostStatus, PostVisibility } from '../entities/post.entity';
import { CategoryEntity } from '../entities/category.entity';
import { TagEntity } from '../entities/tag.entity';
import { CommentEntity, CommentStatus } from '../entities/comment.entity';
import { LinkEntity } from '../entities/link.entity';
import { ConfigEntity } from '../entities/config.entity';
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
} from '../blog.types';
import {
  mapPostEntityToView,
  mapCommentEntityToView,
  buildCommentTree,
} from '../entity-mappers';

@Injectable()
export class BlogQueryService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(LinkEntity)
    private readonly linkRepository: Repository<LinkEntity>,
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
  ) {}

  async getPostById(id: number): Promise<PostView | null> {
    const post = await this.postRepository.findOne({
      where: { id, status: PostStatus.PUBLISHED, visibility: PostVisibility.PUBLIC },
      relations: { tags: true },
    });

    if (!post) return null;

    const commentCount = await this.commentRepository.count({
      where: { postId: id, status: CommentStatus.APPROVED },
    });

    return mapPostEntityToView(post, commentCount);
  }

  async getPostBySlug(slug: string): Promise<PostView | null> {
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, visibility: PostVisibility.PUBLIC },
      relations: { tags: true },
    });

    if (!post) return null;

    const commentCount = await this.commentRepository.count({
      where: { postId: post.id, status: CommentStatus.APPROVED },
    });

    return mapPostEntityToView(post, commentCount);
  }

  async getPosts(options: PostQueryOptions): Promise<{ posts: PostView[]; total: number }> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const offset = (page - 1) * pageSize;

    let query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC });

    if (options.categoryId) {
      query = query.andWhere('post.categoryId = :categoryId', { categoryId: options.categoryId });
    }

    if (options.tagId) {
      query = query.andWhere('tag.id = :tagId', { tagId: options.tagId });
    }

    if (options.search) {
      query = query.andWhere('(post.title LIKE :search OR post.content LIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'DESC';

    query = query.orderBy(`post.isSticky`, 'DESC').addOrderBy(`post.${sortBy}`, sortOrder);

    const [posts, total] = await query.skip(offset).take(pageSize).getManyAndCount();

    const commentCounts = await this.getCommentCounts(posts.map((p) => p.id));

    return {
      posts: posts.map((post) => mapPostEntityToView(post, commentCounts[post.id] || 0)),
      total,
    };
  }

  async getStickyPosts(): Promise<PostView[]> {
    const posts = await this.postRepository.find({
      where: {
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        isSticky: 1,
      },
      relations: { tags: true },
      order: { createdAt: 'DESC' },
    });

    const commentCounts = await this.getCommentCounts(posts.map((p) => p.id));

    return posts.map((post) => mapPostEntityToView(post, commentCounts[post.id] || 0));
  }

  async getCategories(): Promise<CategoryView[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const postCounts = await this.getPostCountsByCategory();

    return categories.map((cat) => ({
      ...cat,
      isActive: cat.isActive === 1,
      postCount: postCounts[cat.id] || 0,
    }));
  }

  async getCategoryTree(): Promise<CategoryTreeView[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const postCounts = await this.getPostCountsByCategory();

    const categoryViews = categories.map((cat) => ({
      ...cat,
      isActive: cat.isActive === 1,
      postCount: postCounts[cat.id] || 0,
    }));

    return this.buildCategoryTree(categoryViews);
  }

  private buildCategoryTree(categories: CategoryView[]): CategoryTreeView[] {
    const categoryMap = new Map<number, CategoryTreeView>();
    const rootCategories: CategoryTreeView[] = [];

    categories.forEach((cat) => {
      const treeNode: CategoryTreeView = {
        ...cat,
        children: [],
      };
      categoryMap.set(cat.id, treeNode);

      if (!cat.parentId || cat.parentId === 0) {
        rootCategories.push(treeNode);
      }
    });

    categories.forEach((cat) => {
      if (cat.parentId && cat.parentId > 0) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id)!);
        }
      }
    });

    return rootCategories;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryView | null> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isActive: 1 },
    });

    if (!category) return null;

    const postCount = await this.postRepository.count({
      where: { categoryId: category.id, status: PostStatus.PUBLISHED },
    });

    return {
      ...category,
      isActive: category.isActive === 1,
      postCount,
    };
  }

  async getTags(): Promise<TagView[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getTagBySlug(slug: string): Promise<TagView | null> {
    return this.tagRepository.findOne({ where: { slug } });
  }

  async getComments(options: CommentQueryOptions): Promise<CommentView[]> {
    let query = this.commentRepository.createQueryBuilder('comment');

    if (options.postId) {
      query = query.where('comment.postId = :postId', { postId: options.postId });
    }

    if (options.status) {
      query = query.andWhere('comment.status = :status', { status: options.status });
    }

    const comments = await query.orderBy('comment.createdAt', 'DESC').getMany();
    return comments.map((c) => mapCommentEntityToView(c));
  }

  async getPostComments(postId: number): Promise<CommentView[]> {
    const comments = await this.commentRepository.find({
      where: { postId, status: CommentStatus.APPROVED },
      order: { createdAt: 'ASC' },
    });

    return buildCommentTree(comments);
  }

  async getLinks(): Promise<LinkView[]> {
    const links = await this.linkRepository.find({
      where: { isActive: 1 },
      order: { sortOrder: 'ASC' },
    });
    return links.map((link) => ({
      ...link,
      isActive: link.isActive === 1,
    }));
  }

  async getConfig(): Promise<ConfigView[]> {
    const configs = await this.configRepository.find();
    return configs.map((c) => ({
      key: c.key,
      value: c.value,
      description: c.description,
    }));
  }

  async getStats(): Promise<BlogStats> {
    const [totalPosts, totalComments, publishedPosts, pendingComments] = await Promise.all([
      this.postRepository.count(),
      this.commentRepository.count(),
      this.postRepository.count({ where: { status: PostStatus.PUBLISHED } }),
      this.commentRepository.count({ where: { status: CommentStatus.PENDING } }),
    ]);

    const viewCountResult = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.viewCount)', 'total')
      .getRawOne();

    const likeCountResult = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.likeCount)', 'total')
      .getRawOne();

    return {
      totalPosts,
      totalComments,
      totalViews: Number(viewCountResult?.total) || 0,
      totalLikes: Number(likeCountResult?.total) || 0,
      publishedPosts,
      pendingComments,
    };
  }

  async getArchiveStats(): Promise<ArchiveStats[]> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .select('YEAR(post.createdAt)', 'year')
      .addSelect('MONTH(post.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .groupBy('YEAR(post.createdAt), MONTH(post.createdAt)')
      .orderBy('year DESC, month DESC')
      .getRawMany();

    return result.map((row) => ({
      year: Number(row.year),
      month: Number(row.month),
      count: Number(row.count),
    }));
  }

  async getNextPost(currentId: number): Promise<PostView | null> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.id > :id', { id: currentId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC })
      .orderBy('post.id', 'ASC')
      .take(1)
      .getOne();

    if (!post) return null;

    const commentCount = await this.commentRepository.count({
      where: { postId: post.id, status: CommentStatus.APPROVED },
    });

    return mapPostEntityToView(post, commentCount);
  }

  async getPreviousPost(currentId: number): Promise<PostView | null> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.id < :id', { id: currentId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC })
      .orderBy('post.id', 'DESC')
      .take(1)
      .getOne();

    if (!post) return null;

    const commentCount = await this.commentRepository.count({
      where: { postId: post.id, status: CommentStatus.APPROVED },
    });

    return mapPostEntityToView(post, commentCount);
  }

  private async getCommentCounts(postIds: number[]): Promise<Record<number, number>> {
    if (postIds.length === 0) return {};

    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('comment.postId IN (:...postIds)', { postIds })
      .andWhere('comment.status = :status', { status: CommentStatus.APPROVED })
      .groupBy('comment.postId')
      .getRawMany();

    return result.reduce(
      (acc, row) => {
        acc[row.postId] = Number(row.count);
        return acc;
      },
      {} as Record<number, number>,
    );
  }

  private async getPostCountsByCategory(): Promise<Record<number, number>> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .select('post.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .groupBy('post.categoryId')
      .getRawMany();

    return result.reduce(
      (acc, row) => {
        acc[row.categoryId] = Number(row.count);
        return acc;
      },
      {} as Record<number, number>,
    );
  }
}
