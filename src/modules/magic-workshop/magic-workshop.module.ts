import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullMqModule } from '../../infrastructure/bullmq/bullmq.module';
import { MagicItemCraftTaskEntity } from './entities/magic-item.entity';
import { MagicItemCraftService } from './services/magic-item-craft.service';
import { MagicItemCraftQueryService } from './queries/magic-item.query.service'; // 新增

@Module({
  imports: [
    TypeOrmModule.forFeature([MagicItemCraftTaskEntity]),
    BullMqModule,
  ],
  providers: [
    MagicItemCraftService,
    MagicItemCraftQueryService, // 新增
  ],
  exports: [
    MagicItemCraftService,
    MagicItemCraftQueryService, // 新增，必须导出
  ],
})
export class MagicWorkshopModule {}