// src/adapters/api/graphql/blog/blog.resolver.module.ts

import { Module } from '@nestjs/common';
import { BlogResolver } from './blog.resolver';
import { BlogUsecasesModule } from '@src/usecases/blog/blog-usecases.module';

@Module({
  imports: [BlogUsecasesModule],
  providers: [BlogResolver],
})
export class BlogResolverModule {}
