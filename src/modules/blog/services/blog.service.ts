// src/modules/blog/services/blog.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { PostEntity, PostStatus, PostVisibility } from '../entities/post.entity';
import { CategoryEntity } from '../entities/category.entity';
import { TagEntity } from '../entities/tag.entity';
import { CommentEntity, CommentStatus } from '../entities/comment.entity';
import { LinkEntity } from '../entities/link.entity';
import { ConfigEntity } from '../entities/config.entity';
import type {
  CreateCategoryInput,
  CreateCommentInput,
  CreateLinkInput,
  CreatePostInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdateCommentInput,
  UpdateConfigInput,
  UpdateLinkInput,
  UpdatePostInput,
  UpdateTagInput,
} from '../blog.types';
const xss = require('xss');

@Injectable()
export class BlogService {
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

  async createPost(
    input: CreatePostInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<PostEntity> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(PostEntity) || this.postRepository;

    const tags = input.tagIds && input.tagIds.length > 0
      ? await this.tagRepository.findBy({ id: In(input.tagIds) })
      : [];

    const now = new Date();
    const post = repo.create({
      ...input,
      isSticky: input.isSticky ? 1 : 0,
      status: input.status || PostStatus.DRAFT,
      visibility: input.visibility || PostVisibility.PUBLIC,
      tags,
      createdAt: now,
      updatedAt: now,
    });

    if (post.status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    return repo.save(post);
  }

  async updatePost(
    input: UpdatePostInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<PostEntity | null> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(PostEntity) || this.postRepository;

    const post = await repo.findOne({ where: { id: input.id } });
    if (!post) return null;

    if (input.tagIds !== undefined) {
      const tags = input.tagIds.length > 0
        ? await this.tagRepository.findBy({ id: In(input.tagIds) })
        : [];
      post.tags = tags;
    }

    if (input.status !== undefined) {
      post.status = input.status;
      if (input.status === PostStatus.PUBLISHED && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    if (input.isSticky !== undefined) {
      post.isSticky = input.isSticky ? 1 : 0;
    }

    Object.assign(post, input);
    return repo.save(post);
  }

  async deletePost(id: number, transactionContext?: PersistenceTransactionContext): Promise<boolean> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(PostEntity) || this.postRepository;

    const result = await repo.update(id, { status: PostStatus.DELETED });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async incrementViewCount(postId: number): Promise<void> {
    await this.postRepository.increment({ id: postId }, 'viewCount', 1);
  }

  async incrementLikeCount(postId: number): Promise<void> {
    await this.postRepository.increment({ id: postId }, 'likeCount', 1);
  }

  async createCategory(
    input: CreateCategoryInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(CategoryEntity) || this.categoryRepository;

    const now = new Date();
    const category = repo.create({
      ...input,
      isActive: input.isActive ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    return repo.save(category);
  }

  async updateCategory(
    input: UpdateCategoryInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CategoryEntity | null> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(CategoryEntity) || this.categoryRepository;

    const category = await repo.findOne({ where: { id: input.id } });
    if (!category) return null;

    if (input.isActive !== undefined) {
      category.isActive = input.isActive ? 1 : 0;
    }

    Object.assign(category, input);
    return repo.save(category);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.categoryRepository.update(id, { isActive: 0 });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async createTag(
    input: CreateTagInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(TagEntity) || this.tagRepository;

    const now = new Date();
    const tag = repo.create({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return repo.save(tag);
  }

  async updateTag(
    input: UpdateTagInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<TagEntity | null> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(TagEntity) || this.tagRepository;

    const tag = await repo.findOne({ where: { id: input.id } });
    if (!tag) return null;

    Object.assign(tag, input);
    return repo.save(tag);
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await this.tagRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async createComment(
    input: CreateCommentInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(CommentEntity) || this.commentRepository;

    const now = new Date();
    const comment = repo.create({
      ...input,
      content: this.sanitizeContent(input.content),
      status: CommentStatus.PENDING,
      authorAvatar: input.authorEmail
        ? `https://www.gravatar.com/avatar/${this.md5(input.authorEmail)}?d=identicon`
        : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return repo.save(comment);
  }

  async rejectComment(id: number): Promise<boolean> {
    const result = await this.commentRepository.update(id, { status: CommentStatus.REJECTED });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  private sanitizeContent(content: string): string {
    return xss(content, {
      whiteList: {
        a: ['href', 'title', 'target'],
        p: [],
        br: [],
        strong: [],
        em: [],
        span: [],
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }

  async updateComment(
    input: UpdateCommentInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<CommentEntity | null> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(CommentEntity) || this.commentRepository;

    const comment = await repo.findOne({ where: { id: input.id } });
    if (!comment) return null;

    Object.assign(comment, input);
    return repo.save(comment);
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await this.commentRepository.update(id, { status: CommentStatus.DELETED });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async approveComment(id: number): Promise<boolean> {
    const result = await this.commentRepository.update(id, { status: CommentStatus.APPROVED });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async incrementCommentLikeCount(commentId: number): Promise<void> {
    await this.commentRepository.increment({ id: commentId }, 'likeCount', 1);
  }

  async createLink(
    input: CreateLinkInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<LinkEntity> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(LinkEntity) || this.linkRepository;

    const now = new Date();
    const link = repo.create({
      ...input,
      isActive: input.isActive ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    return repo.save(link);
  }

  async updateLink(
    input: UpdateLinkInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<LinkEntity | null> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(LinkEntity) || this.linkRepository;

    const link = await repo.findOne({ where: { id: input.id } });
    if (!link) return null;

    if (input.isActive !== undefined) {
      link.isActive = input.isActive ? 1 : 0;
    }

    Object.assign(link, input);
    return repo.save(link);
  }

  async deleteLink(id: number): Promise<boolean> {
    const result = await this.linkRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async getConfig(key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config?.value || null;
  }

  async setConfig(
    input: UpdateConfigInput,
    transactionContext?: PersistenceTransactionContext,
  ): Promise<void> {
    const entityManager = transactionContext ? getTypeOrmEntityManager(transactionContext) : null;
    const repo = entityManager?.getRepository(ConfigEntity) || this.configRepository;

    const existing = await repo.findOne({ where: { key: input.key } });

    if (existing) {
      existing.value = input.value;
      existing.description = input.description;
      await repo.save(existing);
    } else {
      await repo.save(repo.create(input));
    }
  }

  private md5(str: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str.toLowerCase().trim()).digest('hex');
  }
}