import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ApiModule } from './api.module';
import { initGraphQLSchema } from '../../adapters/api/graphql/schema/schema.init';

async function bootstrap() {
  // 必须在 NestJS 创建应用之前注册所有 GraphQL 枚举和标量
  initGraphQLSchema();

  const app = await NestFactory.create(ApiModule);

  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API server listening at http://localhost:${port}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
}

bootstrap();
