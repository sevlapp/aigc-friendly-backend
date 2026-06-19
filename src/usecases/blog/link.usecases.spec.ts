// src/usecases/blog/link.usecases.spec.ts

import {
  CreateLinkUsecase,
  UpdateLinkUsecase,
  DeleteLinkUsecase,
} from './link.usecases';
import type { CreateLinkInput, UpdateLinkInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  createLink: jest.fn(),
  updateLink: jest.fn(),
  deleteLink: jest.fn(),
};

const mockBlogQueryService = {
  getLinks: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Link Use Cases', () => {
  describe('CreateLinkUsecase', () => {
    let usecase: CreateLinkUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreateLinkUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: CreateLinkInput = {
        name: 'GitHub',
        url: 'https://github.com',
        sortOrder: 1,
        isActive: true,
      };

      it('should create a link successfully', async () => {
        const mockResult = {
          id: 1,
          ...baseInput,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createLink.mockResolvedValue(mockResult);
        mockBlogQueryService.getLinks.mockResolvedValue([mockResult]);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('GitHub');
        expect(result?.url).toBe('https://github.com');
        expect(mockBlogService.createLink).toHaveBeenCalled();
      });

      it('should create a link with description and avatar', async () => {
        const inputWithExtras: CreateLinkInput = {
          ...baseInput,
          description: 'Code hosting platform',
          avatar: 'https://github.com/favicon.ico',
        };

        const mockResult = {
          id: 1,
          ...inputWithExtras,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createLink.mockResolvedValue(mockResult);
        mockBlogQueryService.getLinks.mockResolvedValue([mockResult]);

        const result = await usecase.execute(inputWithExtras);

        expect(result?.description).toBe('Code hosting platform');
        expect(result?.avatar).toBe('https://github.com/favicon.ico');
      });

      it('should throw error when creation fails', async () => {
        mockBlogService.createLink.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('UpdateLinkUsecase', () => {
    let usecase: UpdateLinkUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdateLinkUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: UpdateLinkInput = {
        id: 1,
        name: 'Updated Link',
        url: 'https://updated-link.com',
      };

      it('should update a link successfully', async () => {
        const mockUpdated = {
          id: 1,
          name: 'Updated Link',
          url: 'https://updated-link.com',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.updateLink.mockResolvedValue(mockUpdated);
        mockBlogQueryService.getLinks.mockResolvedValue([mockUpdated]);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.name).toBe('Updated Link');
        expect(result?.url).toBe('https://updated-link.com');
        expect(mockBlogService.updateLink).toHaveBeenCalled();
      });

      it('should return null when link does not exist', async () => {
        mockBlogService.updateLink.mockResolvedValue(null);

        const result = await usecase.execute({ id: 999, name: 'Not Found' });

        expect(result).toBeNull();
      });

      it('should update sortOrder and isActive', async () => {
        const inputWithStatus: UpdateLinkInput = {
          id: 1,
          sortOrder: 5,
          isActive: false,
        };

        const mockUpdated = {
          id: 1,
          name: 'GitHub',
          url: 'https://github.com',
          sortOrder: 5,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.updateLink.mockResolvedValue(mockUpdated);
        mockBlogQueryService.getLinks.mockResolvedValue([mockUpdated]);

        const result = await usecase.execute(inputWithStatus);

        expect(result?.sortOrder).toBe(5);
        expect(result?.isActive).toBe(false);
      });

      it('should throw error when update fails', async () => {
        mockBlogService.updateLink.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });

  describe('DeleteLinkUsecase', () => {
    let usecase: DeleteLinkUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new DeleteLinkUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      it('should delete a link successfully', async () => {
        mockBlogService.deleteLink.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
        expect(mockBlogService.deleteLink).toHaveBeenCalledWith(1);
      });

      it('should return false when link does not exist', async () => {
        mockBlogService.deleteLink.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });

      it('should throw error when deletion fails', async () => {
        mockBlogService.deleteLink.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(1)).rejects.toThrow('Database error');
      });
    });
  });
});