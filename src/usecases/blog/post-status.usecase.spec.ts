// src/usecases/blog/post-status.usecase.spec.ts

import { UpdatePostUsecase } from './update-post.usecase';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';

const mockBlogService = {
  updatePost: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Post Status Transition', () => {
  let usecase: UpdatePostUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdatePostUsecase(mockTransactionRunner, mockBlogService as any);
  });

  const basePostEntity: Partial<PostEntity> = {
    id: 1,
    title: 'Test Post',
    slug: 'test-post',
    excerpt: '',
    content: 'Test content',
    coverImage: '',
    status: PostStatus.DRAFT,
    visibility: PostVisibility.PUBLIC,
    viewCount: 0,
    likeCount: 0,
    isSticky: 0,
    categoryId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: undefined,
    tags: [],
  };

  describe('状态流转: DRAFT -> PUBLISHED', () => {
    it('草稿文章发布时应设置 publishedAt', async () => {
      const publishDate = new Date();
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        status: PostStatus.PUBLISHED,
        publishedAt: publishDate,
      });

      const result = await usecase.execute({ id: 1, status: PostStatus.PUBLISHED });

      expect(result?.status).toBe(PostStatus.PUBLISHED);
      expect(result?.publishedAt).toBeDefined();
      expect(mockBlogService.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({ status: PostStatus.PUBLISHED }),
        expect.anything(),
      );
    });
  });

  describe('状态流转: PUBLISHED -> DRAFT', () => {
    it('已发布文章转为草稿', async () => {
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        status: PostStatus.DRAFT,
        publishedAt: undefined,
      });

      const result = await usecase.execute({ id: 1, status: PostStatus.DRAFT });

      expect(result?.status).toBe(PostStatus.DRAFT);
    });
  });

  describe('状态流转: PUBLISHED -> ARCHIVED', () => {
    it('已发布文章归档', async () => {
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        status: PostStatus.ARCHIVED,
      });

      const result = await usecase.execute({ id: 1, status: PostStatus.ARCHIVED });

      expect(result?.status).toBe(PostStatus.ARCHIVED);
    });
  });

  describe('状态流转: ARCHIVED -> PUBLISHED', () => {
    it('归档文章重新发布', async () => {
      const publishDate = new Date();
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        status: PostStatus.PUBLISHED,
        publishedAt: publishDate,
      });

      const result = await usecase.execute({ id: 1, status: PostStatus.PUBLISHED });

      expect(result?.status).toBe(PostStatus.PUBLISHED);
      expect(result?.publishedAt).toBeDefined();
    });
  });

  describe('可见性切换', () => {
    it('公开文章转为私密', async () => {
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        visibility: PostVisibility.PRIVATE,
      });

      const result = await usecase.execute({ id: 1, visibility: PostVisibility.PRIVATE });

      expect(result?.visibility).toBe(PostVisibility.PRIVATE);
    });

    it('私密文章转为公开', async () => {
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        visibility: PostVisibility.PUBLIC,
      });

      const result = await usecase.execute({ id: 1, visibility: PostVisibility.PUBLIC });

      expect(result?.visibility).toBe(PostVisibility.PUBLIC);
    });

    it('设置为保护状态', async () => {
      mockBlogService.updatePost.mockResolvedValue({
        ...basePostEntity,
        visibility: PostVisibility.PROTECTED,
      });

      const result = await usecase.execute({ id: 1, visibility: PostVisibility.PROTECTED });

      expect(result?.visibility).toBe(PostVisibility.PROTECTED);
    });
  });

  describe('状态流转错误路径', () => {
    it('不存在的文章状态切换失败', async () => {
      mockBlogService.updatePost.mockResolvedValue(null);

      const result = await usecase.execute({ id: 999, status: PostStatus.PUBLISHED });

      expect(result).toBeNull();
    });

    it('状态切换数据库错误', async () => {
      mockBlogService.updatePost.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute({ id: 1, status: PostStatus.PUBLISHED })).rejects.toThrow(
        'Database error',
      );
    });
  });
});