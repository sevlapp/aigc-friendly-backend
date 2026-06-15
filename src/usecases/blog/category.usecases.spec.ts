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

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Category Use Cases', () => {
  describe('CreateCategoryUsecase', () => {
    let usecase: CreateCategoryUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreateCategoryUsecase(mockTransactionRunner, mockBlogService as any);
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

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Test Category');
        expect(result?.slug).toBe('test-category');
        expect(mockBlogService.createCategory).toHaveBeenCalled();
      });

      it('should create a category with parent', async () => {
        const inputWithParent: CreateCategoryInput = {
          ...baseInput,
          parentId: 1,
        };

        mockBlogService.createCategory.mockResolvedValue({
          id: 2,
          ...inputWithParent,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        });

        const result = await usecase.execute(inputWithParent);

        expect(result?.parentId).toBe(1);
      });

      it('should handle description', async () => {
        const inputWithDescription: CreateCategoryInput = {
          ...baseInput,
          description: 'Test description',
        };

        mockBlogService.createCategory.mockResolvedValue({
          id: 1,
          ...inputWithDescription,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        });

        const result = await usecase.execute(inputWithDescription);

        expect(result?.description).toBe('Test description');
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
      usecase = new UpdateCategoryUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      const baseInput: UpdateCategoryInput = {
        id: 1,
        name: 'Updated Category',
        slug: 'updated-category',
      };

      it('should update a category successfully', async () => {
        const mockResult = {
          id: 1,
          ...baseInput,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.updateCategory.mockResolvedValue(mockResult);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Updated Category');
        expect(mockBlogService.updateCategory).toHaveBeenCalled();
      });

      it('should update parentId', async () => {
        const inputWithParent: UpdateCategoryInput = {
          id: 1,
          parentId: 2,
        };

        mockBlogService.updateCategory.mockResolvedValue({
          id: 1,
          parentId: 2,
          name: 'Category',
          slug: 'category',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        });

        const result = await usecase.execute(inputWithParent);

        expect(result?.parentId).toBe(2);
      });

      it('should throw error when update fails', async () => {
        mockBlogService.updateCategory.mockRejectedValue(new Error('Category not found'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Category not found');
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
        expect(mockBlogService.deleteCategory).toHaveBeenCalledWith(1, expect.anything());
      });

      it('should return false when category does not exist', async () => {
        mockBlogService.deleteCategory.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });

      it('should throw error when deletion fails', async () => {
        mockBlogService.deleteCategory.mockRejectedValue(
          new Error('Cannot delete category with children'),
        );

        await expect(usecase.execute(1)).rejects.toThrow('Cannot delete category with children');
      });
    });
  });
});
