// src/adapters/worker/blog/blog-worker-adapter.module.ts
import { Module } from '@nestjs/common';
import { BlogWorkerUsecasesModule } from '@src/usecases/blog-worker/blog-worker-usecases.module';
import { BlogWorkerAdapter } from './blog-worker-adapter';

@Module({
  imports: [BlogWorkerUsecasesModule],
  providers: [BlogWorkerAdapter],
  exports: [BlogWorkerAdapter],
})
export class BlogWorkerAdapterModule {}