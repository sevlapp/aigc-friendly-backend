// src/modules/blog/entities/config.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blog_config')
export class ConfigEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt!: Date;
}