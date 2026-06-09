// src/modules/blog/entities/link.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blog_link')
export class LinkEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 512 })
  url!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  avatar?: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  sortOrder!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 1 })
  isActive!: number;

  @Column({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt!: Date;
}