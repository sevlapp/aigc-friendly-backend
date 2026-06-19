// src/usecases/blog/post-relations.usecase.spec.ts

import { CreatePostUsecase } from './create-post.usecase';
import { UpdatePostUsecase } from './update-post.usecase';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import { TagEntity } from '@src/modules/blog/entities/tag.entity';
import type { CreatePostInput, UpdatePostInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  createPost: jest.fn(),
  updatePost: jest.fn(),
};

const mockBlogQueryService = {
  getPostById: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Post Relations (Category & Tags)', () => {
  describe('CreatePost with Relations', () => {
    let usecase: CreatePostUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreatePostUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    const baseInput: CreatePostInput = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      status: PostStatus.DRAFT,
      visibility: PostVisibility.PUBLIC,
      isSticky: false,
    };

    const mockTagViews = [
      {
        id: 1,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JS',
        postCount: 0,
      },
      {
        id: 2,
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TS',
        postCount: 0,
      },
    ];

    it('创建文章时关联单个分类', async () => {
      mockBlogService.createPost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: [],
        commentCount: 0,
      });

      const result = await usecase.execute({ ...baseInput, categoryId: 1 });

      expect(result?.categoryId).toBe(1);
      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 1 }),
        expect.anything(),
      );
    });

    it('创建文章时关联多个标签', async () => {
      mockBlogService.createPost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: mockTagViews,
        commentCount: 0,
      });

      const result = await usecase.execute({ ...baseInput, tagIds: [1, 2] });

      expect(result?.tags).toHaveLength(2);
      expect(result?.tags?.[0].name).toBe('JavaScript');
      expect(result?.tags?.[1].name).toBe('TypeScript');
    });

    it('创建文章时同时关联分类和标签', async () => {
      mockBlogService.createPost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: mockTagViews,
        commentCount: 0,
      });

      const result = await usecase.execute({
        ...baseInput,
        categoryId: 1,
        tagIds: [1, 2],
      });

      expect(result?.categoryId).toBe(1);
      expect(result?.tags).toHaveLength(2);
    });

    it('创建文章时不关联分类和标签', async () => {
      mockBlogService.createPost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: [],
        commentCount: 0,
      });

      const result = await usecase.execute(baseInput);

      expect(result?.categoryId).toBeUndefined();
      expect(result?.tags).toHaveLength(0);
    });
  });

  describe('UpdatePost with Relations', () => {
    let usecase: UpdatePostUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdatePostUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    const mockUpdateTagView = [
      {
        id: 3,
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node',
        postCount: 0,
      },
    ];

    it('更新文章时修改分类', async () => {
      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: [],
        commentCount: 0,
      });

      const result = await usecase.execute({ id: 1, categoryId: 2 });

      expect(result?.categoryId).toBe(2);
    });

    it('更新文章时替换标签', async () => {
      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: mockUpdateTagView,
        commentCount: 0,
      });

      const result = await usecase.execute({ id: 1, tagIds: [3] });

      expect(result?.tags).toHaveLength(1);
      expect(result?.tags?.[0].name).toBe('Node.js');
    });

    it('更新文章时清除标签', async () => {
      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
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
        isSticky: false,
        categoryId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        tags: [],
        commentCount: 0,
      });

      const result = await usecase.execute({ id: 1, tagIds: [] });

      expect(result?.tags).toHaveLength(0);
    });
  });
});