// src/usecases/blog/update-post.usecase.spec.ts

import { UpdatePostUsecase } from './update-post.usecase';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import type { UpdatePostInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  updatePost: jest.fn(),
};

const mockBlogQueryService = {
  getPostById: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('UpdatePostUsecase', () => {
  let usecase: UpdatePostUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new UpdatePostUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
  });

  describe('execute', () => {
    const baseInput: UpdatePostInput = {
      id: 1,
      title: 'Updated Post',
      slug: 'updated-post',
      content: 'Updated content',
    };

    const mockPostView = {
      id: 1,
      title: 'Updated Post',
      slug: 'updated-post',
      excerpt: '',
      content: 'Updated content',
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
    };

    it('成功更新文章并返回文章视图', async () => {
      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue(mockPostView);

      const result = await usecase.execute(baseInput);

      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Updated Post');
      expect(result?.slug).toBe('updated-post');
      expect(result?.content).toBe('Updated content');
      expect(mockBlogService.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Updated Post',
          slug: 'updated-post',
        }),
        expect.anything(),
      );
      expect(mockBlogQueryService.getPostById).toHaveBeenCalledWith(1);
    });

    it('更新文章状态为发布时应自动设置 publishedAt', async () => {
      const inputWithPublish: UpdatePostInput = {
        id: 1,
        status: PostStatus.PUBLISHED,
      };

      const publishedDate = new Date();
      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
        ...mockPostView,
        status: PostStatus.PUBLISHED,
        publishedAt: publishedDate,
      });

      const result = await usecase.execute(inputWithPublish);

      expect(result?.status).toBe(PostStatus.PUBLISHED);
      expect(result?.publishedAt).toBeDefined();
    });

    it('更新文章状态为草稿', async () => {
      const inputWithDraft: UpdatePostInput = {
        id: 1,
        status: PostStatus.DRAFT,
      };

      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
        ...mockPostView,
        status: PostStatus.DRAFT,
      });

      const result = await usecase.execute(inputWithDraft);

      expect(result?.status).toBe(PostStatus.DRAFT);
    });

    it('更新文章标签', async () => {
      const inputWithTags: UpdatePostInput = {
        id: 1,
        tagIds: [1, 2, 3],
      };

      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue(mockPostView);

      await usecase.execute(inputWithTags);

      expect(mockBlogService.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          tagIds: [1, 2, 3],
        }),
        expect.anything(),
      );
    });

    it('更新文章分类', async () => {
      const inputWithCategory: UpdatePostInput = {
        id: 1,
        categoryId: 2,
      };

      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
        ...mockPostView,
        categoryId: 2,
      });

      const result = await usecase.execute(inputWithCategory);

      expect(result?.categoryId).toBe(2);
    });

    it('切换文章置顶状态', async () => {
      const inputWithSticky: UpdatePostInput = {
        id: 1,
        isSticky: true,
      };

      mockBlogService.updatePost.mockResolvedValue({ id: 1 });
      mockBlogQueryService.getPostById.mockResolvedValue({
        ...mockPostView,
        isSticky: true,
      });

      const result = await usecase.execute(inputWithSticky);

      expect(result?.isSticky).toBe(true);
    });

    it('当文章不存在时应返回 null', async () => {
      mockBlogService.updatePost.mockResolvedValue(null);

      const result = await usecase.execute(baseInput);

      expect(result).toBeNull();
    });

    it('当更新失败时应抛出错误', async () => {
      mockBlogService.updatePost.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
    });

    it('验证必填字段：缺少 id 应失败', async () => {
      const invalidInput = { ...baseInput } as any;
      delete invalidInput.id;

      mockBlogService.updatePost.mockRejectedValue(new Error('Validation error: id is required'));

      await expect(usecase.execute(invalidInput as UpdatePostInput)).rejects.toThrow(
        'Validation error: id is required',
      );
    });

    it('验证 id 必须为正整数', async () => {
      const invalidInput: UpdatePostInput = {
        id: -1,
        title: 'Invalid ID',
      };

      mockBlogService.updatePost.mockRejectedValue(
        new Error('Validation error: id must be positive'),
      );

      await expect(usecase.execute(invalidInput)).rejects.toThrow(
        'Validation error: id must be positive',
      );
    });
  });
});
