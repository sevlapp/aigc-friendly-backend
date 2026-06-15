// test/07-blog-queue/blog-queue.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

describe('Blog Queue E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('queueCommentEmailNotification', () => {
    it('成功入队评论邮件通知', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation QueueCommentEmailNotification($input: QueueCommentEmailNotificationInput!) {
              queueCommentEmailNotification(input: $input) {
                jobId
                traceId
              }
            }
          `,
          variables: {
            input: {
              commentId: 'comment-test-001',
              postId: 'post-test-001',
              authorEmail: 'test@example.com',
              authorName: 'Test User',
              postTitle: 'Test Post Title',
              commentContent: 'This is a test comment',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.queueCommentEmailNotification).toBeDefined();
      expect(data?.queueCommentEmailNotification.jobId).toBeDefined();
      expect(data?.queueCommentEmailNotification.traceId).toBeDefined();
    });

    it('支持 dedupKey 和 traceId', async () => {
      const dedupKey = `dedup-${Date.now()}`;
      const traceId = `trace-${Date.now()}`;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation QueueCommentEmailNotification($input: QueueCommentEmailNotificationInput!) {
              queueCommentEmailNotification(input: $input) {
                jobId
                traceId
              }
            }
          `,
          variables: {
            input: {
              commentId: 'comment-test-002',
              postId: 'post-test-002',
              authorEmail: 'test@example.com',
              authorName: 'Test User',
              postTitle: 'Test Post Title',
              commentContent: 'This is a test comment',
              dedupKey,
              traceId,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.queueCommentEmailNotification.traceId).toBe(traceId);
    });

    it('相同 dedupKey 返回已有任务', async () => {
      const dedupKey = `dedup-duplicate-${Date.now()}`;

      const firstResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation QueueCommentEmailNotification($input: QueueCommentEmailNotificationInput!) {
              queueCommentEmailNotification(input: $input) {
                jobId
                traceId
              }
            }
          `,
          variables: {
            input: {
              commentId: 'comment-test-003',
              postId: 'post-test-003',
              authorEmail: 'test@example.com',
              authorName: 'Test User',
              postTitle: 'Test Post Title',
              commentContent: 'This is a test comment',
              dedupKey,
            },
          },
        });

      const firstResult = firstResponse.body.data.queueCommentEmailNotification;

      const secondResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation QueueCommentEmailNotification($input: QueueCommentEmailNotificationInput!) {
              queueCommentEmailNotification(input: $input) {
                jobId
                traceId
              }
            }
          `,
          variables: {
            input: {
              commentId: 'comment-test-004',
              postId: 'post-test-004',
              authorEmail: 'test@example.com',
              authorName: 'Test User',
              postTitle: 'Test Post Title',
              commentContent: 'This is a test comment',
              dedupKey,
            },
          },
        });

      const secondResult = secondResponse.body.data.queueCommentEmailNotification;

      expect(secondResult.jobId).toBe(firstResult.jobId);
      expect(secondResult.traceId).toBe(firstResult.traceId);
    });

    it('缺少必填字段时返回验证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation QueueCommentEmailNotification($input: QueueCommentEmailNotificationInput!) {
              queueCommentEmailNotification(input: $input) {
                jobId
                traceId
              }
            }
          `,
          variables: {
            input: {
              commentId: 'comment-test-005',
              postId: 'post-test-005',
              authorEmail: 'invalid-email',
              authorName: 'Test User',
              postTitle: 'Test Post Title',
              commentContent: 'This is a test comment',
            },
          },
        });

      const { errors } = response.body;
      expect(errors).toBeDefined();
      expect(errors[0].message).toContain('authorEmail');
    });
  });
});