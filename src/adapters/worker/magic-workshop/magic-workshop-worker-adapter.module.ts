import { Module } from '@nestjs/common';
import { MagicWorkshopUsecasesModule } from '@src/usecases/magic-workshop/magic-workshop-usecases.module';
import { MagicItemCraftHandler } from './magic-item-craft.handler';
import { MagicItemCraftProcessor } from './magic-item-craft.processor';

@Module({
  imports: [MagicWorkshopUsecasesModule],
  providers: [MagicItemCraftHandler, MagicItemCraftProcessor],
})
export class MagicWorkshopWorkerAdapterModule {}
