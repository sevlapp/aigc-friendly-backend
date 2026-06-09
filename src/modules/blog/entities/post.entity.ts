// src/modules/blog/entities/post.entity.ts

import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostStatus, PostVisibility } from '@app-types/models/blog.types';
import { CategoryEntity } from './category.entity';
import { TagEntity } from './tag.entity';
import { CommentEntity } from './comment.entity';

export { PostStatus, PostVisibility } from '@app-types/models/blog.types';

@Entity('blog_post')
@Index(['status', 'createdAt'])
export class PostEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'longtext' })
  content!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  coverImage?: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility!: PostVisibility;

  @Column({ type: 'int', unsigned: true, default: 0 })
  viewCount!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  likeCount!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  isSticky!: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  categoryId?: number;

  @Column({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  publishedAt?: Date;

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
  @JoinTable({
    name: 'blog_post_tag',
    joinColumn: { name: 'post_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags!: TagEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity[];
}