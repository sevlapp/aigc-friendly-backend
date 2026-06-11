// src/usecases/blog/get-post.usecase.spec.ts

import { GetPostByIdUsecase } from './get-post.usecase';
import { PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';

const mockBlogQueryService = {
  getPostById: jest.fn(),
};

describe('GetPostByIdUsecase', () => {
  let usecase: GetPostByIdUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetPostByIdUsecase(mockBlogQueryService as any);
  });

  describe('execute', () => {
    const mockPostView = {
      id: 1,
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'Test excerpt',
      content: 'Test content',
      coverImage: '',
      status: PostStatus.PUBLISHED,
      visibility: PostVisibility.PUBLIC,
      viewCount: 100,
      likeCount: 10,
      isSticky: false,
      categoryId: 1,
      categoryName: 'Category 1',
      tags: [{ id: 1, name: 'tag1' }],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    };

    it('成功获取文章详情', async () => {
      mockBlogQueryService.getPostById.mockResolvedValue(mockPostView);

      const result = await usecase.execute({ id: 1 });

      expect(result).toEqual(mockPostView);
      expect(mockBlogQueryService.getPostById).toHaveBeenCalledWith(1);
    });

    it('当文章不存在时应返回 null', async () => {
      mockBlogQueryService.getPostById.mockResolvedValue(null);

      const result = await usecase.execute({ id: 999 });

      expect(result).toBeNull();
    });

    it('当数据库查询失败时应抛出错误', async () => {
      mockBlogQueryService.getPostById.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute({ id: 1 })).rejects.toThrow('Database error');
    });

    it('验证 id 必须为正整数', async () => {
      await expect(usecase.execute({ id: -1 })).rejects.toThrow();
    });
  });
});
