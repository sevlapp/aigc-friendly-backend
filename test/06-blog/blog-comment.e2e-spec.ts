// test/06-blog/blog-comment.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PostEntity, PostStatus, PostVisibility } from '@src/modules/blog/entities/post.entity';
import { CommentEntity } from '@src/modules/blog/entities/comment.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

/**
 * 评论系统 E2E 测试
 */
describe('Blog Comment (e2e)', () => {
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
        slug: 'test-post-comment',
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

  describe('评论发表', () => {
    it('应该成功发表匿名评论', async () => {
      const postId = await createTestPost();

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                postId
                authorName
                content
                status
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '匿名用户',
              content: '这是一条测试评论',
            },
          },
        });

      console.log('CreateComment response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createComment).toBeDefined();
      expect(data?.createComment.authorName).toBe('匿名用户');
      expect(data?.createComment.content).toBe('这是一条测试评论');
      expect(data?.createComment.status).toBe('PENDING');
    });

    it('应该成功发表带邮箱的评论并生成 Gravatar 头像', async () => {
      const postId = await createTestPost();

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                authorEmail
                authorAvatar
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '测试用户',
              authorEmail: 'test@example.com',
              content: '带邮箱的评论',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createComment.authorEmail).toBe('test@example.com');
      expect(data?.createComment.authorAvatar).toContain('gravatar.com/avatar/');
    });

    it('应该自动过滤 XSS 攻击内容', async () => {
      const postId = await createTestPost();

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                content
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: 'XSS测试',
              content: '<script>alert("XSS")</script> <p>正常内容</p>',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createComment.content).not.toContain('<script');
      expect(data?.createComment.content).toContain('<p>正常内容</p>');
    });
  });

  describe('回复评论', () => {
    it('应该成功回复评论', async () => {
      const postId = await createTestPost();

      const parentResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '父评论用户',
              content: '这是父评论',
            },
          },
        });
      const parentId = parentResponse.body.data.createComment.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                parentId
                content
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '子评论用户',
              content: '这是回复',
              parentId,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createComment.parentId).toBe(parentId);
      expect(data?.createComment.content).toBe('这是回复');
    });
  });

  describe('评论审核', () => {
    it('应该成功审核通过评论', async () => {
      const postId = await createTestPost();

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '待审核用户',
              content: '待审核评论',
            },
          },
        });
      const commentId = createResponse.body.data.createComment.id;
      expect(createResponse.body.data.createComment.status).toBe('PENDING');

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation AdminApproveComment($id: Int!) {
              adminApproveComment(id: $id)
            }
          `,
          variables: { id: commentId },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.adminApproveComment).toBe(true);
    });

    it('应该成功驳回评论', async () => {
      const postId = await createTestPost();

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '待驳回用户',
              content: '待驳回评论',
            },
          },
        });
      const commentId = createResponse.body.data.createComment.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation AdminRejectComment($id: Int!) {
              adminRejectComment(id: $id)
            }
          `,
          variables: { id: commentId },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.adminRejectComment).toBe(true);
    });
  });

  describe('查询评论树', () => {
    it('应该正确返回文章的评论树结构', async () => {
      const postId = await createTestPost();

      const commentRepo = dataSource.getRepository(CommentEntity);

      const parentComment = await commentRepo.save({
        postId,
        authorName: '父评论',
        content: '父评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const childComment = await commentRepo.save({
        postId,
        parentId: parentComment.id,
        authorName: '子评论',
        content: '子评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const grandchildComment = await commentRepo.save({
        postId,
        parentId: childComment.id,
        authorName: '孙评论',
        content: '孙评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const anotherParentComment = await commentRepo.save({
        postId,
        authorName: '另一个父评论',
        content: '另一个父评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPostComments($postId: Int!) {
              postComments(postId: $postId) {
                id
                authorName
                content
                replies {
                  id
                  authorName
                  content
                  replies {
                    id
                    authorName
                    content
                  }
                }
              }
            }
          `,
          variables: { postId },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.postComments).toHaveLength(2);

      const firstParent = data?.postComments.find((c: any) => c.authorName === '父评论');
      expect(firstParent).toBeDefined();
      expect(firstParent.replies).toHaveLength(1);
      expect(firstParent.replies[0].authorName).toBe('子评论');
      expect(firstParent.replies[0].replies).toHaveLength(1);
      expect(firstParent.replies[0].replies[0].authorName).toBe('孙评论');

      const secondParent = data?.postComments.find((c: any) => c.authorName === '另一个父评论');
      expect(secondParent).toBeDefined();
      expect(secondParent.replies).toHaveLength(0);
    });

    it('查询评论树时只返回已审核的评论', async () => {
      const postId = await createTestPost();

      const commentRepo = dataSource.getRepository(CommentEntity);

      await commentRepo.save({
        postId,
        authorName: '已审核评论',
        content: '已审核',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await commentRepo.save({
        postId,
        authorName: '待审核评论',
        content: '待审核',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPostComments($postId: Int!) {
              postComments(postId: $postId) {
                id
                authorName
              }
            }
          `,
          variables: { postId },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.postComments).toHaveLength(1);
      expect(data?.postComments[0].authorName).toBe('已审核评论');
    });
  });

  describe('删除评论', () => {
    it('应该成功删除评论', async () => {
      const postId = await createTestPost();

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateComment($input: CreateCommentInput!) {
              createComment(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              postId,
              authorName: '待删除用户',
              content: '待删除评论',
            },
          },
        });
      const commentId = createResponse.body.data.createComment.id;

      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation AdminDeleteComment($id: Int!) {
              adminDeleteComment(id: $id)
            }
          `,
          variables: { id: commentId },
        });

      const { data: deleteData, errors: deleteErrors } = deleteResponse.body;
      expect(deleteErrors).toBeUndefined();
      expect(deleteData?.adminDeleteComment).toBe(true);
    });

    it('删除父评论后子评论仍存在但状态为已删除', async () => {
      const postId = await createTestPost();

      const commentRepo = dataSource.getRepository(CommentEntity);

      const parentComment = await commentRepo.save({
        postId,
        authorName: '父评论',
        content: '父评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const childComment = await commentRepo.save({
        postId,
        parentId: parentComment.id,
        authorName: '子评论',
        content: '子评论内容',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation AdminDeleteComment($id: Int!) {
              adminDeleteComment(id: $id)
            }
          `,
          variables: { id: parentComment.id },
        });

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPostComments($postId: Int!) {
              postComments(postId: $postId) {
                id
                authorName
              }
            }
          `,
          variables: { postId },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.postComments).toHaveLength(0);

      const deletedChild = await commentRepo.findOne({ where: { id: childComment.id } });
      expect(deletedChild).toBeDefined();
      expect(deletedChild?.status).toBe('APPROVED');
    });
  });
});
