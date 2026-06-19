// src/usecases/blog/tag.usecases.spec.ts

import { CreateTagUsecase, UpdateTagUsecase, DeleteTagUsecase } from './tag.usecases';
import type { CreateTagInput, UpdateTagInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  createTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
};

const mockBlogQueryService = {
  getTagBySlug: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Tag Use Cases', () => {
  describe('CreateTagUsecase', () => {
    let usecase: CreateTagUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreateTagUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: CreateTagInput = {
        name: 'Test Tag',
        slug: 'test-tag',
      };

      it('should create a tag successfully', async () => {
        const mockResult = {
          id: 1,
          ...baseInput,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.createTag.mockResolvedValue(mockResult);
        mockBlogQueryService.getTagBySlug.mockResolvedValue(mockResult);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Test Tag');
        expect(result?.slug).toBe('test-tag');
        expect(mockBlogService.createTag).toHaveBeenCalled();
      });

      it('should create a tag with description', async () => {
        const inputWithDescription: CreateTagInput = {
          ...baseInput,
          description: 'Test description',
        };

        const mockResult = {
          id: 1,
          ...inputWithDescription,
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.createTag.mockResolvedValue(mockResult);
        mockBlogQueryService.getTagBySlug.mockResolvedValue(mockResult);

        const result = await usecase.execute(inputWithDescription);

        expect(result?.description).toBe('Test description');
      });

      it('should throw error when creation fails', async () => {
        mockBlogService.createTag.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('UpdateTagUsecase', () => {
    let usecase: UpdateTagUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdateTagUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: UpdateTagInput = {
        id: 1,
        name: 'Updated Tag',
        slug: 'updated-tag',
      };

      it('should update a tag successfully', async () => {
        const mockUpdated = {
          id: 1,
          name: 'Updated Tag',
          slug: 'updated-tag',
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.updateTag.mockResolvedValue(mockUpdated);
        mockBlogQueryService.getTagBySlug.mockResolvedValue(mockUpdated);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Updated Tag');
        expect(mockBlogService.updateTag).toHaveBeenCalled();
      });

      it('should update description only', async () => {
        const inputWithDescription: UpdateTagInput = {
          id: 1,
          description: 'New description',
        };

        const mockUpdated = {
          id: 1,
          name: 'Test Tag',
          slug: 'test-tag',
          description: 'New description',
          createdAt: new Date(),
          updatedAt: new Date(),
          postCount: 0,
        };
        mockBlogService.updateTag.mockResolvedValue(mockUpdated);
        mockBlogQueryService.getTagBySlug.mockResolvedValue(mockUpdated);

        const result = await usecase.execute(inputWithDescription);

        expect(result?.description).toBe('New description');
      });

      it('should return null when tag does not exist', async () => {
        mockBlogService.updateTag.mockResolvedValue(null);

        const result = await usecase.execute({ id: 999, name: 'Not Found' });

        expect(result).toBeNull();
      });

      it('should throw error when update fails', async () => {
        mockBlogService.updateTag.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('DeleteTagUsecase', () => {
    let usecase: DeleteTagUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new DeleteTagUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      it('should delete a tag successfully', async () => {
        mockBlogService.deleteTag.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
        expect(mockBlogService.deleteTag).toHaveBeenCalledWith(1);
      });

      it('should return false when tag does not exist', async () => {
        mockBlogService.deleteTag.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });

      it('should throw error when deletion fails', async () => {
        mockBlogService.deleteTag.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(1)).rejects.toThrow('Database error');
      });
    });
  });
});
