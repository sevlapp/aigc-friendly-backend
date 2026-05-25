import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';
import { MagicItemCraftTaskEntity } from '../entities/magic-item.entity';
import type { MagicItemCraftTaskView } from '../magic-item.types';

@Injectable()
export class MagicItemCraftQueryService {
  constructor(
    @InjectRepository(MagicItemCraftTaskEntity)
    private readonly repository: Repository<MagicItemCraftTaskEntity>,
  ) {}

  async findByJobId(input: {
    readonly jobId: string;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView | null> {
    const repository = this.getRepository(input.transactionContext);
    const entity = await repository.findOne({ where: { jobId: input.jobId } });
    return entity ? this.toView(entity) : null;
  }

  async findByTraceId(input: {
    readonly traceId: string;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView | null> {
    const repository = this.getRepository(input.transactionContext);
    const entity = await repository.findOne({ where: { traceId: input.traceId } });
    return entity ? this.toView(entity) : null;
  }

  async findById(input: {
    readonly id: number;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView | null> {
    const repository = this.getRepository(input.transactionContext);
    const entity = await repository.findOne({ where: { id: input.id } });
    return entity ? this.toView(entity) : null;
  }

  private getRepository(transactionContext?: PersistenceTransactionContext): Repository<MagicItemCraftTaskEntity> {
    if (transactionContext) {
      return getTypeOrmEntityManager(transactionContext).getRepository(MagicItemCraftTaskEntity);
    }
    return this.repository;
  }

  private toView(entity: MagicItemCraftTaskEntity): MagicItemCraftTaskView {
    return {
      id: entity.id,
      jobId: entity.jobId,
      traceId: entity.traceId,
      actorAccountId: entity.actorAccountId,
      actorActiveRole: entity.actorActiveRole,
      itemName: entity.itemName,
      itemType: entity.itemType,
      materialLevel: entity.materialLevel,
      requestNote: entity.requestNote,
      status: entity.status,
      qualityLevel: entity.qualityLevel,
      resultDescription: entity.resultDescription,
      failureReason: entity.failureReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
