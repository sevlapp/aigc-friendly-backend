// test/06-blog/blog-post-status-flow.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

describe('Blog Post Status Flow (e2e)', () => {
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
    await dataSource.getRepository(PostEntity).clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('文章状态流转完整流程', () => {
    it('DRAFT -> PUBLISHED -> ARCHIVED -> PUBLISHED', async () => {
      // Step 1: 创建草稿文章
      const createResponse = await request(app.getHttpServer())
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
              title: '状态流转测试文章',
              slug: 'status-flow-test',
              content: '测试内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;
      expect(createResponse.body.data.createPost.status).toBe('DRAFT');
      expect(createResponse.body.data.createPost.publishedAt).toBeNull();

      // Step 2: 发布文章
      const publishResponse = await request(app.getHttpServer())
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

      expect(publishResponse.body.data.updatePost.status).toBe('PUBLISHED');
      expect(publishResponse.body.data.updatePost.publishedAt).toBeDefined();

      // Step 3: 归档文章
      const archiveResponse = await request(app.getHttpServer())
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
              status: 'ARCHIVED',
            },
          },
        });

      expect(archiveResponse.body.data.updatePost.status).toBe('ARCHIVED');

      // Step 4: 重新发布
      const republishResponse = await request(app.getHttpServer())
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

      expect(republishResponse.body.data.updatePost.status).toBe('PUBLISHED');
      expect(republishResponse.body.data.updatePost.publishedAt).toBeDefined();
    });

    it('已发布文章转为草稿', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '已发布文章',
          slug: 'published-to-draft',
          content: '内容',
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
        }),
      );

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
              id: post.id,
              status: 'DRAFT',
            },
          },
        });

      expect(response.body.data.updatePost.status).toBe('DRAFT');
    });
  });

  describe('文章可见性切换', () => {
    it('PUBLIC -> PRIVATE -> PROTECTED -> PUBLIC', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                id
                visibility
              }
            }
          `,
          variables: {
            input: {
              title: '可见性测试文章',
              slug: 'visibility-test',
              content: '测试内容',
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              isSticky: false,
            },
          },
        });

      const postId = createResponse.body.data.createPost.id;
      expect(createResponse.body.data.createPost.visibility).toBe('PUBLIC');

      // 转为私密
      const privateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                visibility
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              visibility: 'PRIVATE',
            },
          },
        });

      expect(privateResponse.body.data.updatePost.visibility).toBe('PRIVATE');

      // 转为保护
      const protectedResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                visibility
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              visibility: 'PROTECTED',
            },
          },
        });

      expect(protectedResponse.body.data.updatePost.visibility).toBe('PROTECTED');

      // 转回公开
      const publicResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                visibility
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              visibility: 'PUBLIC',
            },
          },
        });

      expect(publicResponse.body.data.updatePost.visibility).toBe('PUBLIC');
    });
  });

  describe('状态流转错误路径', () => {
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
              status: 'PUBLISHED',
            },
          },
        });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updatePost).toBeNull();
    });

    it('无效的状态值应失败', async () => {
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
              title: '测试文章',
              slug: 'invalid-status-test',
              content: '内容',
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
              }
            }
          `,
          variables: {
            input: {
              id: postId,
              status: 'INVALID_STATUS',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });
  });
});