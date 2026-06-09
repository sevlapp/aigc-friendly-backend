// src/modules/blog/entities/comment.entity.ts

import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommentStatus } from '@app-types/models/blog.types';
import { PostEntity } from './post.entity';

export { CommentStatus } from '@app-types/models/blog.types';

@Entity('blog_comment')
@Index(['postId', 'status'])
@Index(['parentId'])
export class CommentEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'int', unsigned: true })
  postId!: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  parentId?: number;

  @Column({ type: 'varchar', length: 100 })
  authorName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorAvatar?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authorIp?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status!: CommentStatus;

  @Column({ type: 'int', unsigned: true, default: 0 })
  likeCount!: number;

  @Column({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  post!: PostEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.id)
  parent?: CommentEntity;
}