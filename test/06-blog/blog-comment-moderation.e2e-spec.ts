// test/06-blog/blog-comment-moderation.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import { CommentEntity, CommentStatus } from '@src/modules/blog/entities/comment.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

/**
 * 评论审核流程 E2E 测试
 */
describe('Blog Comment Moderation (e2e)', () => {
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
      await dataSource.getRepository(CommentEntity).clear();
      await dataSource.getRepository(PostEntity).clear();
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.warn('清理测试数据失败:', error);
    }
  };

  const createTestPost = async (): Promise<number> => {
    const postRepo = dataSource.getRepository(PostEntity);
    const post = await postRepo.save(
      postRepo.create({
        title: '测试文章',
        slug: 'test-post-moderation',
        content: '测试文章内容',
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        isSticky: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      }),
    );
    return post.id;
  };

  const createTestComment = async (postId: number, status: CommentStatus = CommentStatus.PENDING): Promise<number> => {
    const commentRepo = dataSource.getRepository(CommentEntity);
    const comment = await commentRepo.save<CommentEntity>(
      commentRepo.create({
        postId,
        authorName: '测试用户',
        content: '测试评论内容',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return (comment as CommentEntity).id;
  };

  describe('评论审核', () => {
    it('应该成功审核通过待审核评论', async () => {
      const postId = await createTestPost();
      const commentId = await createTestComment(postId, CommentStatus.PENDING);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation ApproveComment($id: Int!) {
              approveComment(id: $id)
            }
          `,
          variables: {
            id: commentId,
          },
        });

      console.log('ApproveComment response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.approveComment).toBe(true);

      const commentRepo = dataSource.getRepository(CommentEntity);
      const updatedComment = await commentRepo.findOneBy({ id: commentId });
      expect(updatedComment?.status).toBe('APPROVED');
    });

    it('应该成功拒绝待审核评论', async () => {
      const postId = await createTestPost();
      const commentId = await createTestComment(postId, CommentStatus.PENDING);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation RejectComment($id: Int!) {
              rejectComment(id: $id)
            }
          `,
          variables: {
            id: commentId,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.rejectComment).toBe(true);

      const commentRepo = dataSource.getRepository(CommentEntity);
      const updatedComment = await commentRepo.findOneBy({ id: commentId });
      expect(updatedComment?.status).toBe('REJECTED');
    });

    it('审核不存在的评论应该返回 false', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation ApproveComment($id: Int!) {
              approveComment(id: $id)
            }
          `,
          variables: {
            id: 99999,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.approveComment).toBe(false);
    });

    it('拒绝不存在的评论应该返回 false', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation RejectComment($id: Int!) {
              rejectComment(id: $id)
            }
          `,
          variables: {
            id: 99999,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.rejectComment).toBe(false);
    });

    it('审核已通过的评论应该保持状态不变', async () => {
      const postId = await createTestPost();
      const commentId = await createTestComment(postId, CommentStatus.APPROVED);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation ApproveComment($id: Int!) {
              approveComment(id: $id)
            }
          `,
          variables: {
            id: commentId,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.approveComment).toBe(true);

      const commentRepo = dataSource.getRepository(CommentEntity);
      const updatedComment = await commentRepo.findOneBy({ id: commentId });
      expect(updatedComment?.status).toBe('APPROVED');
    });

    it('拒绝已拒绝的评论应该保持状态不变', async () => {
      const postId = await createTestPost();
      const commentId = await createTestComment(postId, CommentStatus.REJECTED);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation RejectComment($id: Int!) {
              rejectComment(id: $id)
            }
          `,
          variables: {
            id: commentId,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.rejectComment).toBe(true);

      const commentRepo = dataSource.getRepository(CommentEntity);
      const updatedComment = await commentRepo.findOneBy({ id: commentId });
      expect(updatedComment?.status).toBe('REJECTED');
    });
  });
});