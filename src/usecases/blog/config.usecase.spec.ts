// src/usecases/blog/config.usecase.spec.ts

import { UpdateConfigUsecase } from './config.usecase';
import type { UpdateConfigInput } from '@src/modules/blog/blog.types';

const mockBlogService = {
  setConfig: jest.fn(),
};

const mockBlogQueryService = {
  getConfig: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Config Use Cases', () => {
  describe('UpdateConfigUsecase', () => {
    let usecase: UpdateConfigUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdateConfigUsecase(mockTransactionRunner, mockBlogService as any, mockBlogQueryService as any);
    });

    describe('execute', () => {
      const baseInput: UpdateConfigInput = {
        key: 'site_title',
        value: 'My Blog',
        description: '网站标题',
      };

      it('should update a config successfully', async () => {
        const mockConfig = {
          key: 'site_title',
          value: 'My Blog',
          description: '网站标题',
        };
        mockBlogService.setConfig.mockResolvedValue(undefined);
        mockBlogQueryService.getConfig.mockResolvedValue([mockConfig]);

        const result = await usecase.execute(baseInput);

        expect(result?.key).toBe('site_title');
        expect(result?.value).toBe('My Blog');
        expect(result?.description).toBe('网站标题');
        expect(mockBlogService.setConfig).toHaveBeenCalled();
      });

      it('should create new config when key does not exist', async () => {
        const newConfigInput: UpdateConfigInput = {
          key: 'new_setting',
          value: 'new_value',
        };

        const mockNewConfig = {
          key: 'new_setting',
          value: 'new_value',
          description: undefined,
        };
        mockBlogService.setConfig.mockResolvedValue(undefined);
        mockBlogQueryService.getConfig.mockResolvedValue([mockNewConfig]);

        const result = await usecase.execute(newConfigInput);

        expect(result?.key).toBe('new_setting');
        expect(result?.value).toBe('new_value');
      });

      it('should return null when config not found after update', async () => {
        mockBlogService.setConfig.mockResolvedValue(undefined);
        mockBlogQueryService.getConfig.mockResolvedValue([]);

        const result = await usecase.execute({ key: 'nonexistent', value: 'test' });

        expect(result).toBeNull();
      });

      it('should update config without description', async () => {
        const inputNoDesc: UpdateConfigInput = {
          key: 'site_footer',
          value: 'Copyright 2024',
        };

        const mockConfig = {
          key: 'site_footer',
          value: 'Copyright 2024',
          description: undefined,
        };
        mockBlogService.setConfig.mockResolvedValue(undefined);
        mockBlogQueryService.getConfig.mockResolvedValue([mockConfig]);

        const result = await usecase.execute(inputNoDesc);

        expect(result?.key).toBe('site_footer');
        expect(result?.value).toBe('Copyright 2024');
      });

      it('should throw error when update fails', async () => {
        mockBlogService.setConfig.mockRejectedValue(new Error('Database error'));

        await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
      });
    });
  });
});