// src/modules/blog/entities/category.entity.ts

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('blog_category')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  description?: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  parentId?: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  sortOrder!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 1 })
  isActive!: number;

  @Column({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @OneToMany(() => PostEntity, (post) => post.categoryId)
  posts!: PostEntity[];
}