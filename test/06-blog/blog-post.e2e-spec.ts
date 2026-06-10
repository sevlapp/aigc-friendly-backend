// test/06-blog/blog-post.e2e-spec.ts

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
 * 文章管理 E2E 测试
 */
describe('Blog Post (e2e)', () => {
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

  const createTestCategory = async (): Promise<number> => {
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const category = await categoryRepo.save(
      categoryRepo.create({
        name: '测试分类',
        slug: 'test-category',
        sortOrder: 1,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return category.id;
  };

  const createTestTag = async (): Promise<number> => {
    const tagRepo = dataSource.getRepository(TagEntity);
    const tag = await tagRepo.save(
      tagRepo.create({
        name: '测试标签',
        slug: 'test-tag',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return tag.id;
  };

  describe('文章创建', () => {
    it('应该成功创建草稿文章', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                slug
                content
                status
                visibility
                isSticky
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'test-post',
              content: '这是一篇测试文章的内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      console.log('CreatePost response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost).toBeDefined();
      expect(data?.createPost.title).toBe('测试文章');
      expect(data?.createPost.slug).toBe('test-post');
      expect(data?.createPost.status).toBe('DRAFT');
      expect(data?.createPost.visibility).toBe('PUBLIC');
      expect(data?.createPost.isSticky).toBe(false);
    });

    it('应该成功创建已发布文章', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                status
                publishedAt
              }
            }
          `,
          variables: {
            input: {
              title: '已发布文章',
              slug: 'published-post',
              content: '这是一篇已发布的文章',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost.status).toBe('PUBLISHED');
      expect(data?.createPost.publishedAt).toBeDefined();
    });

    it('创建文章时可以指定分类', async () => {
      const categoryId = await createTestCategory();

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                categoryId
                categoryName
              }
            }
          `,
          variables: {
            input: {
              title: '带分类文章',
              slug: 'post-with-category',
              content: '这篇文章有分类',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
              categoryId,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost.categoryId).toBe(categoryId);
    });

    it('创建文章时可以指定标签', async () => {
      const tagId = await createTestTag();

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
              title: '带标签文章',
              slug: 'post-with-tags',
              content: '这篇文章有标签',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
              tagIds: [tagId],
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost.tags).toHaveLength(1);
      expect(data?.createPost.tags[0].name).toBe('测试标签');
    });

    it('创建文章时缺少必填字段应失败', async () => {
      const response = await request(app.getHttpServer())
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
              title: '缺少slug',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const { errors } = response.body;
      expect(errors).toBeDefined();
    });

    it('创建文章时slug重复应失败', async () => {
      await request(app.getHttpServer())
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
              title: '文章1',
              slug: 'duplicate-slug',
              content: '内容1',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const response = await request(app.getHttpServer())
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
              title: '文章2',
              slug: 'duplicate-slug',
              content: '内容2',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const { errors } = response.body;
      expect(errors).toBeDefined();
    });
  });

  describe('文章查询', () => {
    it('应该成功查询文章列表', async () => {
      await request(app.getHttpServer())
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
              slug: 'query-test-post',
              content: '查询测试内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPosts($page: Int, $pageSize: Int) {
              posts(page: $page, pageSize: $pageSize) {
                posts {
                  id
                  title
                  slug
                }
                total
                page
                pageSize
              }
            }
          `,
          variables: {
            page: 1,
            pageSize: 10,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.posts.posts).toBeDefined();
      expect(data?.posts.total).toBeGreaterThanOrEqual(1);
      expect(data?.posts.page).toBe(1);
      expect(data?.posts.pageSize).toBe(10);
    });

    it('应该成功查询单篇文章', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
              }
            }
          `,
          variables: {
            input: {
              title: '单篇查询测试',
              slug: 'single-query-test',
              content: '单篇查询内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
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
                slug
                content
              }
            }
          `,
          variables: {
            id: postId,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.post.id).toBe(postId);
      expect(data?.post.title).toBe('单篇查询测试');
    });

    it('查询不存在的文章应返回 null', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPost($id: Int!) {
              post(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: 99999,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.post).toBeNull();
    });
  });

  describe('文章更新', () => {
    it('应该成功更新文章', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                title
                slug
              }
            }
          `,
          variables: {
            input: {
              title: '待更新文章',
              slug: 'to-update-post',
              content: '待更新内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                title
                slug
                status
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              title: '已更新文章',
              slug: 'updated-post',
              status: 'PUBLISHED',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.id).toBe(postId);
      expect(data?.updatePost.title).toBe('已更新文章');
      expect(data?.updatePost.slug).toBe('updated-post');
      expect(data?.updatePost.status).toBe('PUBLISHED');
    });

    it('应该成功切换文章状态', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              title: '状态切换测试',
              slug: 'status-switch-test',
              content: '状态切换内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              status: 'PUBLISHED',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.status).toBe('PUBLISHED');
    });

    it('更新不存在的文章应返回 null', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              id: 99999,
              title: '不存在的文章',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost).toBeNull();
    });
  });

  describe('文章删除', () => {
    it('应该成功软删除文章', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              title: '待删除文章',
              slug: 'to-delete-post',
              content: '待删除内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeletePost($id: Int!) {
              deletePost(id: $id)
            }
          `,
          variables: {
            id: postId,
          },
        });

      const { data: deleteData, errors: deleteErrors } = deleteResponse.body;
      expect(deleteErrors).toBeUndefined();
      expect(deleteData?.deletePost).toBe(true);

      const queryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPost($id: Int!) {
              post(id: $id) {
                id
                status
              }
            }
          `,
          variables: {
            id: postId,
          },
        });

      const { data: queryData, errors: queryErrors } = queryResponse.body;
      expect(queryErrors).toBeUndefined();
      expect(queryData?.post).toBeNull();
    });

    it('删除不存在的文章应返回 false', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeletePost($id: Int!) {
              deletePost(id: $id)
            }
          `,
          variables: {
            id: 99999,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.deletePost).toBe(false);
    });
  });

  describe('文章状态切换', () => {
    it('草稿 -> 发布', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              title: '草稿转发布',
              slug: 'draft-to-published',
              content: '草稿转发布内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                status
                publishedAt
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              status: 'PUBLISHED',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.status).toBe('PUBLISHED');
      expect(data?.updatePost.publishedAt).toBeDefined();
    });

    it('发布 -> 草稿', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              title: '发布转草稿',
              slug: 'published-to-draft',
              content: '发布转草稿内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              status: 'DRAFT',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.status).toBe('DRAFT');
    });
  });
});