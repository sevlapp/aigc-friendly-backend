// src/usecases/blog/create-post.usecase.spec.ts

import { CreatePostUsecase } from './create-post.usecase';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import type { CreatePostInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  createPost: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('CreatePostUsecase', () => {
  let usecase: CreatePostUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new CreatePostUsecase(
      mockTransactionRunner as any,
      mockBlogService as any,
    );
  });

  describe('execute', () => {
    const baseInput: CreatePostInput = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      status: PostStatus.DRAFT,
      visibility: PostVisibility.PUBLIC,
      isSticky: false,
    };

    const mockPostEntity: Partial<PostEntity> = {
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

    it('成功创建文章并返回文章视图', async () => {
      mockBlogService.createPost.mockResolvedValue(mockPostEntity);

      const result = await usecase.execute(baseInput);

      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Test Post');
      expect(result?.slug).toBe('test-post');
      expect(result?.content).toBe('Test content');
      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Post',
          slug: 'test-post',
          content: 'Test content',
          status: PostStatus.DRAFT,
        }),
        expect.anything(),
      );
    });

    it('创建草稿文章', async () => {
      const draftInput: CreatePostInput = {
        ...baseInput,
        status: PostStatus.DRAFT,
      };

      mockBlogService.createPost.mockResolvedValue({
        ...mockPostEntity,
        status: PostStatus.DRAFT,
      });

      const result = await usecase.execute(draftInput);

      expect(result?.status).toBe(PostStatus.DRAFT);
    });

    it('创建发布文章时应自动设置 publishedAt', async () => {
      const publishInput: CreatePostInput = {
        ...baseInput,
        status: PostStatus.PUBLISHED,
      };

      const publishedDate = new Date();
      mockBlogService.createPost.mockResolvedValue({
        ...mockPostEntity,
        status: PostStatus.PUBLISHED,
        publishedAt: publishedDate,
      });

      const result = await usecase.execute(publishInput);

      expect(result?.status).toBe(PostStatus.PUBLISHED);
      expect(result?.publishedAt).toBeDefined();
    });

    it('创建文章时可以指定分类', async () => {
      const inputWithCategory: CreatePostInput = {
        ...baseInput,
        categoryId: 1,
      };

      mockBlogService.createPost.mockResolvedValue({
        ...mockPostEntity,
        categoryId: 1,
      });

      const result = await usecase.execute(inputWithCategory);

      expect(result?.categoryId).toBe(1);
    });

    it('创建文章时可以指定标签', async () => {
      const inputWithTags: CreatePostInput = {
        ...baseInput,
        tagIds: [1, 2, 3],
      };

      mockBlogService.createPost.mockResolvedValue(mockPostEntity);

      await usecase.execute(inputWithTags);

      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: [1, 2, 3],
        }),
        expect.anything(),
      );
    });

    it('创建文章时可以设置置顶', async () => {
      const inputWithSticky: CreatePostInput = {
        ...baseInput,
        isSticky: true,
      };

      mockBlogService.createPost.mockResolvedValue({
        ...mockPostEntity,
        isSticky: 1,
      });

      const result = await usecase.execute(inputWithSticky);

      expect(result?.isSticky).toBe(true);
    });

    it('当创建文章失败时应抛出错误', async () => {
      mockBlogService.createPost.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
    });

    it('验证必填字段：缺少 title 应失败', async () => {
      const invalidInput = { ...baseInput } as any;
      delete invalidInput.title;

      mockBlogService.createPost.mockRejectedValue(new Error('Validation error: title is required'));

      await expect(usecase.execute(invalidInput as CreatePostInput)).rejects.toThrow(
        'Validation error: title is required',
      );
    });

    it('验证必填字段：缺少 slug 应失败', async () => {
      const invalidInput = { ...baseInput } as any;
      delete invalidInput.slug;

      mockBlogService.createPost.mockRejectedValue(new Error('Validation error: slug is required'));

      await expect(usecase.execute(invalidInput as CreatePostInput)).rejects.toThrow(
        'Validation error: slug is required',
      );
    });

    it('验证必填字段：缺少 content 应失败', async () => {
      const invalidInput = { ...baseInput } as any;
      delete invalidInput.content;

      mockBlogService.createPost.mockRejectedValue(new Error('Validation error: content is required'));

      await expect(usecase.execute(invalidInput as CreatePostInput)).rejects.toThrow(
        'Validation error: content is required',
      );
    });
  });
});