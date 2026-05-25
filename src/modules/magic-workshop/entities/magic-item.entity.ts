import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  MAGIC_CRAFT_STATUSES,
  MAGIC_ITEM_TYPES,
  MAGIC_QUALITY_LEVELS,
  type MagicCraftStatus,
  type MagicItemType,
  type MagicQualityLevel,
  MagicItemTypeEnum, // 新增枚举导入
} from '../magic-item.types';

@Entity('magic_item_craft_task')
@Index('uk_magic_item_craft_task_job_id', ['jobId'], { unique: true })
@Index('idx_magic_item_craft_task_trace_id', ['traceId'])
@Index('idx_magic_item_craft_task_actor_account_id', ['actorAccountId'])
@Index('idx_magic_item_craft_task_status', ['status'])
export class MagicItemCraftTaskEntity {
  @PrimaryGeneratedColumn({ type: 'int', comment: '主键ID' })
  id!: number;

  @Column({ name: 'job_id', type: 'varchar', length: 191, comment: 'BullMQ任务ID' })
  jobId!: string;

  @Column({ name: 'trace_id', type: 'varchar', length: 128, comment: '链路追踪ID' })
  traceId!: string;

  @Column({ name: 'actor_account_id', type: 'int', nullable: true, comment: '发起账号ID' })
  actorAccountId!: number | null;

  @Column({
    name: 'actor_active_role',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '发起时角色快照',
  })
  actorActiveRole!: string | null;

  @Column({ name: 'item_name', type: 'varchar', length: 128, comment: '道具名称' })
  itemName!: string;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: MAGIC_ITEM_TYPES,
    comment: '道具类型：WEAPON / ARMOR / TOOL / TOY',
  })
  itemType!: MagicItemTypeEnum;

  @Column({ name: 'material_level', type: 'int', comment: '材料等级 1-5' })
  materialLevel!: number;

  @Column({ name: 'request_note', type: 'varchar', length: 512, nullable: true, comment: '请求备注' })
  requestNote!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MAGIC_CRAFT_STATUSES,
    default: MAGIC_CRAFT_STATUSES[0],
    comment: '任务状态：PENDING / PROCESSING / SUCCEEDED / FAILED',
  })
  status!: MagicCraftStatus;

  @Column({
    name: 'quality_level',
    type: 'enum',
    enum: MAGIC_QUALITY_LEVELS,
    nullable: true,
    comment: '品质等级：COMMON / RARE / EPIC / LEGENDARY',
  })
  qualityLevel!: MagicQualityLevel | null;

  @Column({ name: 'result_description', type: 'text', nullable: true, comment: '制作结果描述' })
  resultDescription!: string | null;

  @Column({ name: 'failure_reason', type: 'varchar', length: 256, nullable: true, comment: '失败原因' })
  failureReason!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间',
  })
  updatedAt!: Date;
}
