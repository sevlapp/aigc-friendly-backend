// test/06-blog/blog-link.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { LinkEntity } from '@src/modules/blog/entities/link.entity';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

/**
 * 链接管理 E2E 测试
 */
describe('Blog Link (e2e)', () => {
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
      await dataSource.getRepository(LinkEntity).clear();
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.warn('清理测试数据失败:', error);
    }
  };

  describe('链接管理', () => {
    it('应该成功创建链接', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
                name
                url
                isActive
              }
            }
          `,
          variables: {
            input: {
              name: 'GitHub',
              url: 'https://github.com',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      console.log('CreateLink response:', JSON.stringify(response.body, null, 2));
      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createLink).toBeDefined();
      expect(data?.createLink.name).toBe('GitHub');
      expect(data?.createLink.url).toBe('https://github.com');
      expect(data?.createLink.isActive).toBe(true);
    });

    it('应该成功创建带描述和头像的链接', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
                name
                url
                description
                avatar
              }
            }
          `,
          variables: {
            input: {
              name: 'Twitter',
              url: 'https://twitter.com',
              description: '社交平台',
              avatar: 'https://twitter.com/favicon.ico',
              sortOrder: 2,
              isActive: true,
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.createLink.description).toBe('社交平台');
      expect(data?.createLink.avatar).toBe('https://twitter.com/favicon.ico');
    });

    it('应该成功更新链接', async () => {
      // 先创建链接
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'Old Name',
              url: 'https://old-url.com',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const linkId = createResponse.body.data.createLink.id;

      // 更新链接
      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateLink($input: UpdateLinkInput!) {
              updateLink(input: $input) {
                id
                name
                url
              }
            }
          `,
          variables: {
            input: {
              id: linkId,
              name: 'Updated Name',
              url: 'https://updated-url.com',
            },
          },
        });

      const { data, errors } = updateResponse.body;
      expect(errors).toBeUndefined();
      expect(data?.updateLink.name).toBe('Updated Name');
      expect(data?.updateLink.url).toBe('https://updated-url.com');
    });

    it('应该成功更新链接的排序和状态', async () => {
      // 先创建链接
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'Test Link',
              url: 'https://test.com',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const linkId = createResponse.body.data.createLink.id;

      // 更新排序和状态
      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateLink($input: UpdateLinkInput!) {
              updateLink(input: $input) {
                id
                sortOrder
                isActive
              }
            }
          `,
          variables: {
            input: {
              id: linkId,
              sortOrder: 5,
              isActive: false,
            },
          },
        });

      const { data, errors } = updateResponse.body;
      expect(errors).toBeUndefined();
      expect(data?.updateLink.sortOrder).toBe(5);
      expect(data?.updateLink.isActive).toBe(false);
    });

    it('更新不存在的链接应该返回 null', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateLink($input: UpdateLinkInput!) {
              updateLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              id: 99999,
              name: 'Not Found',
            },
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.updateLink).toBeNull();
    });

    it('应该成功删除链接', async () => {
      // 先创建链接
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'To Delete',
              url: 'https://delete.com',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      const linkId = createResponse.body.data.createLink.id;

      // 删除链接
      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteLink($id: Int!) {
              deleteLink(id: $id)
            }
          `,
          variables: {
            id: linkId,
          },
        });

      const { data, errors } = deleteResponse.body;
      expect(errors).toBeUndefined();
      expect(data?.deleteLink).toBe(true);

      // 验证链接已删除
      const linkRepo = dataSource.getRepository(LinkEntity);
      const deletedLink = await linkRepo.findOneBy({ id: linkId });
      expect(deletedLink).toBeNull();
    });

    it('删除不存在的链接应该返回 false', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteLink($id: Int!) {
              deleteLink(id: $id)
            }
          `,
          variables: {
            id: 99999,
          },
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.deleteLink).toBe(false);
    });

    it('应该成功查询所有链接', async () => {
      // 创建多个链接
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'Link 1',
              url: 'https://link1.com',
              sortOrder: 1,
              isActive: true,
            },
          },
        });

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateLink($input: CreateLinkInput!) {
              createLink(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'Link 2',
              url: 'https://link2.com',
              sortOrder: 2,
              isActive: true,
            },
          },
        });

      // 查询链接列表
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetLinks {
              links {
                id
                name
                url
              }
            }
          `,
        });

      const { data, errors } = response.body;
      expect(errors).toBeUndefined();
      expect(data?.links).toBeDefined();
      expect(data?.links.length).toBeGreaterThanOrEqual(2);
    });
  });
});