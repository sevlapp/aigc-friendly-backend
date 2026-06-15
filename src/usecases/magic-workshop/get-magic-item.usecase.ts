import { Injectable } from '@nestjs/common';
import { MagicItemCraftQueryService } from '@src/modules/magic-workshop/queries/magic-item.query.service';
import type { MagicItemCraftTaskView } from '@src/modules/magic-workshop/magic-item.types';

export interface GetMagicItemCraftTaskByJobIdResult {
  readonly id: number;
  readonly itemName: string;
  readonly itemType: string;
  readonly status: string;
  readonly qualityLevel: string | null;
  readonly resultDescription: string | null;
  readonly failureReason: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@Injectable()
export class GetMagicItemCraftTaskUsecase {
  constructor(private readonly magicItemCraftQueryService: MagicItemCraftQueryService) {}

  async getById(id: number): Promise<GetMagicItemCraftTaskByJobIdResult | null> {
    const task = await this.magicItemCraftQueryService.findById({ id });
    if (!task) {
      return null;
    }
    return {
      id: task.id,
      itemName: task.itemName,
      itemType: task.itemType,
      status: task.status,
      qualityLevel: task.qualityLevel,
      resultDescription: task.resultDescription,
      failureReason: task.failureReason,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
