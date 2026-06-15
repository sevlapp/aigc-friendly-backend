// src/infrastructure/database/migrations/1779596704000-blog-initial.ts

import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class BlogInitial1779596704000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blog_category',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
            default: 0,
          },
          {
            name: 'sort_order',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            unsigned: true,
            default: 1,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_tag',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'post_count',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_post',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'excerpt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'longtext',
          },
          {
            name: 'cover_image',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED'],
            default: "'DRAFT'",
          },
          {
            name: 'visibility',
            type: 'enum',
            enum: ['PUBLIC', 'PRIVATE', 'PROTECTED'],
            default: "'PUBLIC'",
          },
          {
            name: 'view_count',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'like_count',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'is_sticky',
            type: 'tinyint',
            unsigned: true,
            default: 0,
          },
          {
            name: 'category_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'published_at',
            type: 'datetime',
            precision: 3,
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_post_tag',
        columns: [
          {
            name: 'post_id',
            type: 'int',
            unsigned: true,
            isPrimary: true,
          },
          {
            name: 'tag_id',
            type: 'int',
            unsigned: true,
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_comment',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'post_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'author_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'author_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'author_avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'author_ip',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED'],
            default: "'PENDING'",
          },
          {
            name: 'like_count',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_link',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '512',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            unsigned: true,
            default: 1,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'blog_config',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 3,
            default: 'CURRENT_TIMESTAMP(3)',
            onUpdate: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'blog_post',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_category',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'blog_post_tag',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_post',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'blog_post_tag',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_tag',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'blog_comment',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_post',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'blog_comment',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_comment',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_blog_post_status_created_at',
        columnNames: ['status', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_blog_post_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'blog_comment',
      new TableIndex({
        name: 'IDX_blog_comment_post_id_status',
        columnNames: ['post_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'blog_comment',
      new TableIndex({
        name: 'IDX_blog_comment_parent_id',
        columnNames: ['parent_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blog_config', true);
    await queryRunner.dropTable('blog_link', true);
    await queryRunner.dropTable('blog_comment', true);
    await queryRunner.dropTable('blog_post_tag', true);
    await queryRunner.dropTable('blog_post', true);
    await queryRunner.dropTable('blog_tag', true);
    await queryRunner.dropTable('blog_category', true);
  }
}
