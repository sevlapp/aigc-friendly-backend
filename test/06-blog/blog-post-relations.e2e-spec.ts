// test/06-blog/blog-post-relations.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import { CategoryEntity } from '@src/modules/blog/entities/category.entity';
import { TagEntity } from '@src/modules/blog/entities/tag.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

describe('Blog Post Relations (e2e)', () => {
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
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM blog_post_tag').catch(() => {});
    await dataSource.getRepository(PostEntity).clear();
    await dataSource.getRepository(CategoryEntity).clear();
    await dataSource.getRepository(TagEntity).clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  const createCategory = async (name: string, slug: string): Promise<number> => {
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const category = await categoryRepo.save(
      categoryRepo.create({
        name,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return category.id;
  };

  const createTag = async (name: string, slug: string): Promise<number> => {
    const tagRepo = dataSource.getRepository(TagEntity);
    const tag = await tagRepo.save(
      tagRepo.create({
        name,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return tag.id;
  };

  describe('文章与分类关联', () => {
    it('创建文章时关联分类', async () => {
      const categoryId = await createCategory('技术', 'tech');

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
              }
            }
          `,
          variables: {
            input: {
              title: '带分类的文章',
              slug: 'post-with-category',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              categoryId,
              isSticky: false,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPost.categoryId).toBe(categoryId);
    });

    it('更新文章时修改分类', async () => {
      const category1Id = await createCategory('分类1', 'category-1');
      const category2Id = await createCategory('分类2', 'category-2');

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                categoryId
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'category-change-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              categoryId: category1Id,
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                categoryId
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              categoryId: category2Id,
            },
          },
        });

      expect(updateResponse.body.data.updatePost.categoryId).toBe(category2Id);
    });

    it('更新文章时清除分类', async () => {
      const categoryId = await createCategory('临时分类', 'temp');

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                categoryId
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'remove-category-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              categoryId,
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                categoryId
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              categoryId: null,
            },
          },
        });

      expect(updateResponse.body.data.updatePost.categoryId).toBeNull();
    });

    it('关联不存在的分类时系统接受传入值', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                categoryId
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'invalid-category-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              categoryId: 99999,
              isSticky: false,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPost.categoryId).toBe(99999);
    });
  });

  describe('文章与标签关联', () => {
    it('创建文章时关联多个标签', async () => {
      const tag1Id = await createTag('JavaScript', 'javascript');
      const tag2Id = await createTag('TypeScript', 'typescript');

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                tags {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              title: '带标签的文章',
              slug: 'post-with-tags',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              tagIds: [tag1Id, tag2Id],
              isSticky: false,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPost.tags).toHaveLength(2);
      expect(response.body.data.createPost.tags.map((t: any) => t.name)).toContain('JavaScript');
      expect(response.body.data.createPost.tags.map((t: any) => t.name)).toContain('TypeScript');
    });

    it('更新文章时替换标签', async () => {
      const tag1Id = await createTag('旧标签1', 'old-tag-1');
      const tag2Id = await createTag('旧标签2', 'old-tag-2');
      const newTagId = await createTag('新标签', 'new-tag');

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                tags {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'replace-tags-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              tagIds: [tag1Id, tag2Id],
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                tags {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              tagIds: [newTagId],
            },
          },
        });

      expect(updateResponse.body.data.updatePost.tags).toHaveLength(1);
      expect(updateResponse.body.data.updatePost.tags[0].name).toBe('新标签');
    });

    it('更新文章时清除所有标签', async () => {
      const tagId = await createTag('临时标签', 'temp-tag');

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                tags {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'clear-tags-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              tagIds: [tagId],
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                tags {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              tagIds: [],
            },
          },
        });

      expect(updateResponse.body.data.updatePost.tags).toHaveLength(0);
    });

    it('关联不存在的标签应返回空标签列表', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                tags {
                  id
                }
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'invalid-tags-test',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              tagIds: [99999, 88888],
              isSticky: false,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPost.tags).toHaveLength(0);
    });
  });

  describe('文章与分类、标签同时关联', () => {
    it('创建文章时同时关联分类和多个标签', async () => {
      const categoryId = await createCategory('综合', 'general');
      const tag1Id = await createTag('前端', 'frontend');
      const tag2Id = await createTag('后端', 'backend');

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                categoryId
                tags {
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              title: '全栈开发文章',
              slug: 'fullstack-post',
              content: '全栈内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              categoryId,
              tagIds: [tag1Id, tag2Id],
              isSticky: false,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createPost.categoryId).toBe(categoryId);
      expect(response.body.data.createPost.tags).toHaveLength(2);
    });
  });
});