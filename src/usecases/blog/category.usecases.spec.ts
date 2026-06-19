// src/usecases/blog/category.usecases.spec.ts

import {
  CreateCategoryUsecase,
  UpdateCategoryUsecase,
  DeleteCategoryUsecase,
} from './category.usecases';
import type { CreateCategoryInput, UpdateCategoryInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
};

const mockBlogQueryService = {
  getCategoryBySlug: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Category Use Cases', () => {
  describe('CreateCategoryUsecase', () => {
    let usecase: CreateCategoryUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreateCategoryUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: CreateCategoryInput = {
        name: 'Test Category',
        slug: 'test-category',
        sortOrder: 1,
        isActive: true,
      };

      it('should create a category successfully', async () => {
        const mockResult = {
          id: 1,
          ...baseInput,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.createCategory.mockResolvedValue(mockResult);
        mockBlogQueryService.getCategoryBySlug.mockResolvedValue(mockResult);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Test Category');
        expect(mockBlogService.createCategory).toHaveBeenCalled();
      });

      it('should throw error when creation fails', async () => {
        mockBlogService.createCategory.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('UpdateCategoryUsecase', () => {
    let usecase: UpdateCategoryUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdateCategoryUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: UpdateCategoryInput = {
        id: 1,
        name: 'Updated Category',
        slug: 'updated-category',
      };

      it('should update a category successfully', async () => {
        const mockUpdated = {
          id: 1,
          name: 'Updated Category',
          slug: 'updated-category',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.updateCategory.mockResolvedValue(mockUpdated);
        mockBlogQueryService.getCategoryBySlug.mockResolvedValue(mockUpdated);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Updated Category');
        expect(mockBlogService.updateCategory).toHaveBeenCalled();
      });

      it('should return null when category does not exist', async () => {
        mockBlogService.updateCategory.mockResolvedValue(null);

        const result = await usecase.execute({ id: 999, name: 'Not Found' });

        expect(result).toBeNull();
      });

      it('should throw error when update fails', async () => {
        mockBlogService.updateCategory.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('DeleteCategoryUsecase', () => {
    let usecase: DeleteCategoryUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new DeleteCategoryUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      it('should delete a category successfully', async () => {
        mockBlogService.deleteCategory.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
        expect(mockBlogService.deleteCategory).toHaveBeenCalledWith(1);
      });

      it('should return false when category does not exist', async () => {
        mockBlogService.deleteCategory.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });

      it('should throw error when deletion fails', async () => {
        mockBlogService.deleteCategory.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(1)).rejects.toThrow('Database error');
      });
    });
  });
});
