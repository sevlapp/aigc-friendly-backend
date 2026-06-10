// src/modules/blog/queries/blog.query.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlogQueryService } from './blog.query.service';
import { PostEntity } from '../entities/post.entity';
import { CategoryEntity } from '../entities/category.entity';
import { TagEntity } from '../entities/tag.entity';
import { CommentEntity } from '../entities/comment.entity';
import { LinkEntity } from '../entities/link.entity';
import { ConfigEntity } from '../entities/config.entity';
import type { CategoryView } from '../blog.types';

describe('BlogQueryService', () => {
  let service: BlogQueryService;
  let categoryRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogQueryService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TagEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(LinkEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ConfigEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BlogQueryService>(BlogQueryService);
    categoryRepository = module.get(getRepositoryToken(CategoryEntity));
  });

  describe('buildCategoryTree', () => {
    it('should build a flat category list into a tree structure', () => {
      const categories: CategoryView[] = [
        {
          id: 1,
          name: 'Root Category',
          slug: 'root',
          description: 'Root category',
          parentId: 0,
          sortOrder: 1,
          isActive: true,
          postCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Child Category',
          slug: 'child',
          description: 'Child category',
          parentId: 1,
          sortOrder: 1,
          isActive: true,
          postCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Grandchild Category',
          slug: 'grandchild',
          description: 'Grandchild category',
          parentId: 2,
          sortOrder: 1,
          isActive: true,
          postCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Another Root',
          slug: 'another-root',
          description: 'Another root category',
          parentId: 0,
          sortOrder: 2,
          isActive: true,
          postCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = (service as any).buildCategoryTree(categories);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('Root Category');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe(2);
      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0].id).toBe(3);
      expect(result[1].id).toBe(4);
      expect(result[1].name).toBe('Another Root');
      expect(result[1].children).toHaveLength(0);
    });

    it('should handle categories with no parent', () => {
      const categories: CategoryView[] = [
        {
          id: 1,
          name: 'Category 1',
          slug: 'cat1',
          description: '',
          parentId: undefined,
          sortOrder: 1,
          isActive: true,
          postCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Category 2',
          slug: 'cat2',
          description: '',
          parentId: undefined,
          sortOrder: 2,
          isActive: true,
          postCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = (service as any).buildCategoryTree(categories);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle empty category list', () => {
      const categories: CategoryView[] = [];

      const result = (service as any).buildCategoryTree(categories);

      expect(result).toHaveLength(0);
    });

    it('should handle orphan categories (parent not found)', () => {
      const categories: CategoryView[] = [
        {
          id: 1,
          name: 'Root',
          slug: 'root',
          description: '',
          parentId: 0,
          sortOrder: 1,
          isActive: true,
          postCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Orphan',
          slug: 'orphan',
          description: '',
          parentId: 999,
          sortOrder: 2,
          isActive: true,
          postCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = (service as any).buildCategoryTree(categories);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should handle single root category', () => {
      const categories: CategoryView[] = [
        {
          id: 1,
          name: 'Single Root',
          slug: 'single',
          description: '',
          parentId: 0,
          sortOrder: 1,
          isActive: true,
          postCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = (service as any).buildCategoryTree(categories);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].children).toHaveLength(0);
    });
  });
});
