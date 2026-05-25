import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMagicItemCraftTaskTable1780000000000 implements MigrationInterface {
  name = 'CreateMagicItemCraftTaskTable1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`magic_item_craft_task\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
        \`job_id\` varchar(191) NOT NULL COMMENT 'BullMQ任务ID',
        \`trace_id\` varchar(128) NOT NULL COMMENT '链路追踪ID',
        \`actor_account_id\` int DEFAULT NULL COMMENT '发起账号ID',
        \`actor_active_role\` varchar(64) DEFAULT NULL COMMENT '发起时角色快照',
        \`item_name\` varchar(128) NOT NULL COMMENT '道具名称',
        \`item_type\` enum('WEAPON','ARMOR','TOOL','TOY') NOT NULL COMMENT '道具类型',
        \`material_level\` int NOT NULL COMMENT '材料等级 1-5',
        \`request_note\` varchar(512) DEFAULT NULL COMMENT '请求备注',
        \`status\` enum('PENDING','PROCESSING','SUCCEEDED','FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '任务状态',
        \`quality_level\` enum('COMMON','RARE','EPIC','LEGENDARY') DEFAULT NULL COMMENT '品质等级',
        \`result_description\` text DEFAULT NULL COMMENT '制作结果描述',
        \`failure_reason\` varchar(256) DEFAULT NULL COMMENT '失败原因',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_magic_item_craft_task_job_id\` (\`job_id\`),
        KEY \`idx_magic_item_craft_task_trace_id\` (\`trace_id\`),
        KEY \`idx_magic_item_craft_task_actor_account_id\` (\`actor_account_id\`),
        KEY \`idx_magic_item_craft_task_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='魔法道具制作任务表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `magic_item_craft_task`;');
  }
}
