import { Module } from '@nestjs/common';
import { AsyncTaskRecordModule } from '@src/modules/async-task-record/async-task-record.module';
import { MagicWorkshopModule } from '@src/modules/magic-workshop/magic-workshop.module';
import { ConsumeMagicItemCraftTaskUsecase } from './consume-magic-item.usecase';
import { GetMagicItemCraftTaskUsecase } from './get-magic-item.usecase';
import { QueueMagicItemUsecase } from './queue-magic-item.usecase';

@Module({
  imports: [MagicWorkshopModule, AsyncTaskRecordModule],
  providers: [
    QueueMagicItemUsecase,
    ConsumeMagicItemCraftTaskUsecase,
    GetMagicItemCraftTaskUsecase,
  ],
  exports: [QueueMagicItemUsecase, ConsumeMagicItemCraftTaskUsecase, GetMagicItemCraftTaskUsecase],
})
export class MagicWorkshopUsecasesModule {}
