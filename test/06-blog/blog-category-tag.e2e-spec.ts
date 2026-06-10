// test/06-blog/blog-category-tag.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import { CategoryEntity } from '@src/modules/blog/entities/category.entity';
import { TagEntity } from '@src/modules/blog/entities/tag.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

/**
 * 分类与标签管理 E2E 测试
 */
describe('Blog Category & Tag (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  const cleanupTestData = async (): Promise<void> => {
    try {
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await dataSource.getRepository(TagEntity).clear();
      await dataSource.getRepository(CategoryEntity).clear();
      await dataSource.getRepository(PostEntity).clear();
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.warn('清理测试数据失败:', error);
    }
  };

  describe('分类管理', () => {
    it('应该成功创建分类', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
                name
                slug
                description
                parentId
                sortOrder
                isActive
                postCount
              }
            }
          `,
          variables: {
            input: {
              name: '测试分类',
              slug: 'test-category',
              description: '这是一个测试分类',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      console.log('CreateCategory response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createCategory).toBeDefined();
      expect(data?.createCategory.name).toBe('测试分类');
      expect(data?.createCategory.slug).toBe('test-category');
      expect(data?.createCategory.description).toBe('这是一个测试分类');
      expect(data?.createCategory.isActive).toBe(true);
      expect(data?.createCategory.postCount).toBe(0);
    });

    it('应该成功创建子分类', async () => {
      const parentResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: {
              name: '父分类',
              slug: 'parent-category',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const parentId = parentResponse.body.data.createCategory.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
                name
                parentId
              }
            }
          `,
          variables: {
            input: {
              name: '子分类',
              slug: 'child-category',
              parentId,
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createCategory.name).toBe('子分类');
      expect(data?.createCategory.parentId).toBe(parentId);
    });

    it('应该成功更新分类', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: {
              name: '待更新分类',
              slug: 'to-update-category',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const categoryId = createResponse.body.data.createCategory.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateCategory($input: UpdateCategoryInput!) {
              updateCategory(input: $input) {
                id
                name
                slug
                description
              }
            }
          `,
          variables: {
            input: {
              id: categoryId,
              name: '已更新分类',
              slug: 'updated-category',
              description: '更新后的描述',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updateCategory.id).toBe(categoryId);
      expect(data?.updateCategory.name).toBe('已更新分类');
      expect(data?.updateCategory.slug).toBe('updated-category');
      expect(data?.updateCategory.description).toBe('更新后的描述');
    });

    it('应该成功删除分类', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '待删除分类',
              slug: 'to-delete-category',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const categoryId = createResponse.body.data.createCategory.id;

      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteCategory($id: Int!) {
              deleteCategory(id: $id)
            }
          `,
          variables: {
            id: categoryId,
          },
        });

      const { data: deleteData, errors: deleteErrors } = deleteResponse.body;
      expect(deleteErrors).toBeUndefined();
      expect(deleteData?.deleteCategory).toBe(true);
    });

    it('应该成功查询分类列表', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '查询测试分类',
              slug: 'query-test-category',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetCategories {
              categories {
                id
                name
                slug
              }
            }
          `,
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.categories).toBeDefined();
      expect(data?.categories.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('标签管理', () => {
    it('应该成功创建标签', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
                name
                slug
                description
                postCount
              }
            }
          `,
          variables: {
            input: {
              name: '测试标签',
              slug: 'test-tag',
              description: '这是一个测试标签',
            },
          },
        });

      console.log('CreateTag response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createTag).toBeDefined();
      expect(data?.createTag.name).toBe('测试标签');
      expect(data?.createTag.slug).toBe('test-tag');
      expect(data?.createTag.description).toBe('这是一个测试标签');
      expect(data?.createTag.postCount).toBe(0);
    });

    it('应该成功更新标签', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: {
              name: '待更新标签',
              slug: 'to-update-tag',
            },
          },
        });

      const tagId = createResponse.body.data.createTag.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateTag($input: UpdateTagInput!) {
              updateTag(input: $input) {
                id
                name
                slug
              }
            }
          `,
          variables: {
            input: {
              id: tagId,
              name: '已更新标签',
              slug: 'updated-tag',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updateTag.id).toBe(tagId);
      expect(data?.updateTag.name).toBe('已更新标签');
      expect(data?.updateTag.slug).toBe('updated-tag');
    });

    it('应该成功删除标签', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '待删除标签',
              slug: 'to-delete-tag',
            },
          },
        });

      const tagId = createResponse.body.data.createTag.id;

      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteTag($id: Int!) {
              deleteTag(id: $id)
            }
          `,
          variables: {
            id: tagId,
          },
        });

      const { data: deleteData, errors: deleteErrors } = deleteResponse.body;
      expect(deleteErrors).toBeUndefined();
      expect(deleteData?.deleteTag).toBe(true);
    });

    it('应该成功查询标签列表', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '查询测试标签',
              slug: 'query-test-tag',
            },
          },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetTags {
              tags {
                id
                name
                slug
              }
            }
          `,
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.tags).toBeDefined();
      expect(data?.tags.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('文章与分类/标签关联', () => {
    it('创建文章时关联分类和标签', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '测试分类',
              slug: 'test-category-relation',
              sortOrder: 1,
              isActive: true,
            },
          },
        });
      const categoryId = categoryResponse.body.data.createCategory.id;

      const tag1Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '标签1',
              slug: 'tag1',
            },
          },
        });
      const tag1Id = tag1Response.body.data.createTag.id;

      const tag2Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '标签2',
              slug: 'tag2',
            },
          },
        });
      const tag2Id = tag2Response.body.data.createTag.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                categoryId
                categoryName
                tags {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              title: '带分类和标签的文章',
              slug: 'post-with-category-tags',
              content: '这篇文章关联了分类和多个标签',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
              categoryId,
              tagIds: [tag1Id, tag2Id],
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost.categoryId).toBe(categoryId);
      expect(data?.createPost.categoryName).toBe('测试分类');
      expect(data?.createPost.tags).toHaveLength(2);
      expect(data?.createPost.tags.map((t: any) => t.name)).toContain('标签1');
      expect(data?.createPost.tags.map((t: any) => t.name)).toContain('标签2');
    });

    it('查询文章时正确返回分类和标签列表', async () => {
      const categoryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '查询测试分类',
              slug: 'query-category',
              sortOrder: 1,
              isActive: true,
            },
          },
        });
      const categoryId = categoryResponse.body.data.createCategory.id;

      const tagResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '查询测试标签',
              slug: 'query-tag',
            },
          },
        });
      const tagId = tagResponse.body.data.createTag.id;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              title: '查询测试文章',
              slug: 'query-test-post-rel',
              content: '查询测试内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
              categoryId,
              tagIds: [tagId],
            },
          },
        });
      const postId = createResponse.body.data.createPost.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPost($id: Int!) {
              post(id: $id) {
                id
                title
                categoryId
                categoryName
                tags {
                  id
                  name
                  slug
                }
              }
            }
          `,
          variables: {
            id: postId,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.post.categoryId).toBe(categoryId);
      expect(data?.post.categoryName).toBe('查询测试分类');
      expect(data?.post.tags).toHaveLength(1);
      expect(data?.post.tags[0].name).toBe('查询测试标签');
    });
  });

  describe('分类树形结构', () => {
    it('应该正确构建分类树形结构', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '根分类1',
              slug: 'root1',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const root2Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '根分类2',
              slug: 'root2',
              sortOrder: 2,
              isActive: true,
            },
          },
        });
      const root2Id = root2Response.body.data.createCategory.id;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '子分类',
              slug: 'child',
              parentId: root2Id,
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetCategoryTree {
              categoryTree {
                id
                name
                parentId
                children {
                  id
                  name
                  parentId
                }
              }
            }
          `,
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.categoryTree).toHaveLength(2);

      const root2 = data?.categoryTree.find((c: any) => c.name === '根分类2');
      expect(root2).toBeDefined();
      expect(root2.children).toHaveLength(1);
      expect(root2.children[0].name).toBe('子分类');
      expect(root2.children[0].parentId).toBe(root2Id);
    });

    it('应该正确处理多层级分类', async () => {
      const rootResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '根分类',
              slug: 'multi-root',
              sortOrder: 1,
              isActive: true,
            },
          },
        });
      const rootId = rootResponse.body.data.createCategory.id;

      const childResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '一级子分类',
              slug: 'level1',
              parentId: rootId,
              sortOrder: 1,
              isActive: true,
            },
          },
        });
      const childId = childResponse.body.data.createCategory.id;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: '二级子分类',
              slug: 'level2',
              parentId: childId,
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetCategoryTree {
              categoryTree {
                id
                name
                children {
                  id
                  name
                  children {
                    id
                    name
                  }
                }
              }
            }
          `,
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.categoryTree).toHaveLength(1);

      const root = data?.categoryTree[0];
      expect(root.name).toBe('根分类');
      expect(root.children).toHaveLength(1);
      expect(root.children[0].name).toBe('一级子分类');
      expect(root.children[0].children).toHaveLength(1);
      expect(root.children[0].children[0].name).toBe('二级子分类');
    });
  });
});
