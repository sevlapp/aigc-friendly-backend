// src/modules/blog/blog.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { LinkEntity } from './entities/link.entity';
import { ConfigEntity } from './entities/config.entity';
import { BlogService } from './services/blog.service';
import { BlogQueryService } from './queries/blog.query.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      CategoryEntity,
      TagEntity,
      CommentEntity,
      LinkEntity,
      ConfigEntity,
    ]),
  ],
  providers: [BlogService, BlogQueryService],
  exports: [BlogService, BlogQueryService],
})
export class BlogModule {}