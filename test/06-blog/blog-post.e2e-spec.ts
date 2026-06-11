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
      await dataSource.getRepository(PostEntity).clear();
      await dataSource.getRepository(CategoryEntity).clear();
      await dataSource.getRepository(TagEntity).clear();
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

  describe('创建文章', () => {
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
              }
            }
          `,
          variables: {
            input: {
              title: '测试文章',
              slug: 'test-post',
              content: '测试文章内容',
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
    });

    it('应该成功创建已发布文章并自动设置 publishedAt', async () => {
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
              content: '已发布内容',
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
              title: '带标签的文章',
              slug: 'post-with-tags',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
              tagIds: [tagId],
              isSticky: false,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createPost.tags).toHaveLength(1);
      expect(data?.createPost.tags[0].name).toBe('测试标签');
    });

    it('缺少必填字段 title 应失败', async () => {
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
              slug: 'missing-title',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });

    it('缺少必填字段 slug 应失败', async () => {
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
              title: '缺少 slug',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });

    it('重复 slug 应失败', async () => {
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
              title: '第一篇文章',
              slug: 'duplicate-slug',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
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
              title: '第二篇文章',
              slug: 'duplicate-slug',
              content: '内容',
              status: 'DRAFT',
              visibility: 'PUBLIC',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('查询文章', () => {
    it('应该成功查询单篇文章', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '查询测试文章',
          slug: 'query-test-post',
          content: '查询内容',
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
            query GetPost($id: Int!) {
              post(id: $id) {
                id
                title
                slug
                content
              }
            }
          `,
          variables: { id: post.id },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.post).toBeDefined();
      expect(data?.post.title).toBe('查询测试文章');
      expect(data?.post.slug).toBe('query-test-post');
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
          variables: { id: 99999 },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.post).toBeNull();
    });

    it('应该成功查询文章列表', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      await postRepo.save([
        postRepo.create({
          title: '文章1',
          slug: 'post-1',
          content: '内容1',
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          publishedAt: new Date('2024-01-01'),
        }),
        postRepo.create({
          title: '文章2',
          slug: 'post-2',
          content: '内容2',
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          publishedAt: new Date('2024-01-02'),
        }),
      ]);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPosts($page: Int, $pageSize: Int) {
              posts(page: $page, pageSize: $pageSize) {
                posts {
                  id
                  title
                }
                total
                page
                pageSize
              }
            }
          `,
          variables: { page: 1, pageSize: 10 },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.posts.posts).toHaveLength(2);
      expect(data?.posts.total).toBe(2);
    });

    it('应该按状态筛选文章（公共查询）', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      await postRepo.save([
        postRepo.create({
          title: '草稿文章',
          slug: 'draft-post',
          content: '内容',
          status: PostStatus.DRAFT,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        postRepo.create({
          title: '已发布文章',
          slug: 'published-post',
          content: '内容',
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
        }),
      ]);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query Posts($status: PostStatus) {
              posts(status: $status) {
                posts {
                  id
                  title
                  status
                }
                total
              }
            }
          `,
          variables: { status: 'PUBLISHED' },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.posts.posts).toHaveLength(1);
      expect(data?.posts.posts[0].status).toBe('PUBLISHED');
    });
  });

  describe('更新文章', () => {
    it('应该成功更新文章内容', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '原始标题',
          slug: 'original-slug',
          content: '原始内容',
          status: PostStatus.DRAFT,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdatePost($input: UpdatePostInput!) {
              updatePost(input: $input) {
                id
                title
                content
              }
            }
          `,
          variables: {
            input: {
              id: post.id,
              title: '更新后的标题',
              content: '更新后的内容',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.title).toBe('更新后的标题');
      expect(data?.updatePost.content).toBe('更新后的内容');
    });

    it('更新文章状态为发布时应自动设置 publishedAt', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '待发布文章',
          slug: 'to-be-published',
          content: '内容',
          status: PostStatus.DRAFT,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
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
              status: 'PUBLISHED',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updatePost.status).toBe('PUBLISHED');
      expect(data?.updatePost.publishedAt).toBeDefined();
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

  describe('删除文章', () => {
    it('应该成功软删除文章', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '待删除文章',
          slug: 'to-be-deleted',
          content: '内容',
          status: PostStatus.DRAFT,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeletePost($id: Int!) {
              deletePost(id: $id)
            }
          `,
          variables: { id: post.id },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.deletePost).toBe(true);

      const deletedPost = await postRepo.findOne({ where: { id: post.id } });
      expect(deletedPost?.status).toBe(PostStatus.DELETED);
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
          variables: { id: 99999 },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.deletePost).toBe(false);
    });
  });

  describe('状态流转', () => {
    it('应该正确进行状态流转：草稿 → 已发布', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '状态流转测试',
          slug: 'status-flow-test',
          content: '内容',
          status: PostStatus.DRAFT,
          visibility: PostVisibility.PUBLIC,
          createdAt: new Date(),
          updatedAt: new Date(),
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
              status: 'PUBLISHED',
            },
          },
        });
      expect(response.body.data?.updatePost.status).toBe('PUBLISHED');
      expect(response.body.data?.updatePost.publishedAt).toBeDefined();
    });

    it('应该正确进行状态流转：已发布 → 回收站', async () => {
      const postRepo = dataSource.getRepository(PostEntity);
      const post = await postRepo.save(
        postRepo.create({
          title: '测试删除',
          slug: 'delete-test',
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
            mutation DeletePost($id: Int!) {
              deletePost(id: $id)
            }
          `,
          variables: { id: post.id },
        });

      expect(response.body.data?.deletePost).toBe(true);

      const deletedPost = await postRepo.findOne({ where: { id: post.id } });
      expect(deletedPost?.status).toBe(PostStatus.DELETED);
    });
  });
});
