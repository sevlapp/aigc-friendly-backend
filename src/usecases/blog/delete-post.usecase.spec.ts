// src/usecases/blog/delete-post.usecase.spec.ts

import { DeletePostUsecase } from './delete-post.usecase';

const mockBlogService = {
  deletePost: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('DeletePostUsecase', () => {
  let usecase: DeletePostUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new DeletePostUsecase(mockTransactionRunner, mockBlogService as any);
  });

  describe('execute', () => {
    it('成功软删除文章', async () => {
      mockBlogService.deletePost.mockResolvedValue(true);

      const result = await usecase.execute(1);

      expect(result).toBe(true);
      expect(mockBlogService.deletePost).toHaveBeenCalledWith(1, expect.anything());
    });

    it('当文章不存在时应返回 false', async () => {
      mockBlogService.deletePost.mockResolvedValue(false);

      const result = await usecase.execute(999);

      expect(result).toBe(false);
    });

    it('删除失败时应返回 false', async () => {
      mockBlogService.deletePost.mockResolvedValue(false);

      const result = await usecase.execute(1);

      expect(result).toBe(false);
    });

    it('当数据库错误时应抛出异常', async () => {
      mockBlogService.deletePost.mockRejectedValue(new Error('Database connection failed'));

      await expect(usecase.execute(1)).rejects.toThrow('Database connection failed');
    });

    it('验证 id 必须为正整数', async () => {
      mockBlogService.deletePost.mockRejectedValue(
        new Error('Validation error: id must be positive'),
      );

      await expect(usecase.execute(-1)).rejects.toThrow('Validation error: id must be positive');
    });

    it('验证 id 不能为零', async () => {
      mockBlogService.deletePost.mockRejectedValue(
        new Error('Validation error: id must be positive'),
      );

      await expect(usecase.execute(0)).rejects.toThrow('Validation error: id must be positive');
    });
  });
});
