// test/06-blog/blog-category.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '@src/bootstraps/api/api.module';
import request from 'supertest';
import { initGraphQLSchema } from '../../src/adapters/api/graphql/schema/schema.init';

describe('Blog Category (e2e)', () => {
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

  describe('分类创建', () => {
    it('创建顶级分类', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateCategory($input: CreateCategoryInput!) {
              createCategory(input: $input) {
                id
                name
                slug
              }
            }
          `,
          variables: {
            input: {
              name: '技术',
              slug: 'tech',
              isActive: true,
              sortOrder: 1,
            },
          },
        });

      expect(response.body).toHaveProperty('data');
    });
  });
});
