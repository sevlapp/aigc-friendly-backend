// test/06-blog/blog-tag.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import request from 'supertest';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

describe('Blog Tag (e2e)', () => {
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
    if (app) {
      await app.close();
    }
  });

  describe('标签创建', () => {
    it('创建标签', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
                name
                slug
              }
            }
          `,
          variables: {
            input: {
              name: 'JavaScript',
              slug: 'javascript',
            },
          },
        });

      expect(response.body).toHaveProperty('data');
    });

    it('创建带描述的标签', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateTag($input: CreateTagInput!) {
              createTag(input: $input) {
                id
                name
                description
              }
            }
          `,
          variables: {
            input: {
              name: 'TypeScript',
              slug: 'typescript',
              description: 'TypeScript language',
            },
          },
        });

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('标签查询', () => {
    it('查询所有标签', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              tags {
                id
                name
              }
            }
          `,
        });

      expect(response.body).toHaveProperty('data');
    });

    it('根据 slug 查询标签', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query TagBySlug($slug: String!) {
              tag(slug: $slug) {
                id
                name
              }
            }
          `,
          variables: {
            slug: 'test-tag',
          },
        });

      expect(response.body).toHaveProperty('data');
    });
  });
});
