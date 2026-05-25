import { MagicItemTypeEnum } from '../magic-item.types';
import { Injectable } from '@nestjs/common';
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { BullMqProducerGateway } from '@src/infrastructure/bullmq/producer.gateway';
import { PinoLogger } from 'nestjs-pino';
import type {
  CreateMagicItemCraftTaskInput,
  MagicItemCraftTaskView,
  QueueMagicItemInput,
  QueueMagicItemResult,
  UpdateMagicItemCraftTaskStatusInput,
} from '../magic-item.types';
import { MagicItemCraftTaskEntity } from '../entities/magic-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PersistenceTransactionContext } from '@app-types/common/transaction.types';
import { getTypeOrmEntityManager } from '@src/infrastructure/database/transaction/typeorm-persistence-transaction-context';

@Injectable()
export class MagicItemCraftService {
  constructor(
    private readonly producer: BullMqProducerGateway,
    private readonly logger: PinoLogger,
    @InjectRepository(MagicItemCraftTaskEntity)
    private readonly magicItemCraftTaskRepository: Repository<MagicItemCraftTaskEntity>,
  ) {
    this.logger.setContext(MagicItemCraftService.name);
  }

  async enqueueCraft(input: QueueMagicItemInput): Promise<QueueMagicItemResult> {
    const job = await this.producer.enqueue({
      queueName: BULLMQ_QUEUES.MAGIC_WORKSHOP,
      jobName: BULLMQ_JOBS.MAGIC_WORKSHOP.CRAFT,
      payload: {
        itemName: input.itemName,
        itemType: input.itemType as MagicItemTypeEnum,
        materialLevel: input.materialLevel,
        requestNote: input.requestNote,
        traceId: input.traceId || `magic-craft-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      },
      dedupKey: input.dedupKey,
      traceId: input.traceId,
    });

    this.logger.info(
      {
        itemName: input.itemName,
        itemType: input.itemType,
        materialLevel: input.materialLevel,
        jobId: job.jobId,
        traceId: job.traceId,
      },
      'Magic item craft job accepted',
    );

    return {
      jobId: job.jobId,
      traceId: job.traceId,
      taskId: 0,
    };
  }

  async createTask(input: {
    readonly data: CreateMagicItemCraftTaskInput;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView> {
    const repository = this.getRepository(input.transactionContext);
    const entity = repository.create({
      jobId: input.data.jobId,
      traceId: input.data.traceId,
      actorAccountId: input.data.actorAccountId ?? null,
      actorActiveRole: input.data.actorActiveRole ?? null,
      itemName: input.data.itemName,
      itemType: input.data.itemType,
      materialLevel: input.data.materialLevel,
      requestNote: input.data.requestNote ?? null,
      status: 'PENDING',
    });
    const saved = await repository.save(entity);
    return this.toView(saved);
  }

  async updateTaskStatus(input: {
    readonly data: UpdateMagicItemCraftTaskStatusInput;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView | null> {
    const repository = this.getRepository(input.transactionContext);
    const entity = await repository.findOne({ where: { jobId: input.data.jobId } });
    if (!entity) {
      return null;
    }
    entity.status = input.data.status;
    if (input.data.qualityLevel !== undefined) {
      entity.qualityLevel = input.data.qualityLevel;
    }
    if (input.data.resultDescription !== undefined) {
      entity.resultDescription = input.data.resultDescription;
    }
    if (input.data.failureReason !== undefined) {
      entity.failureReason = input.data.failureReason;
    }
    const saved = await repository.save(entity);
    return this.toView(saved);
  }

  async findByJobId(input: {
    readonly jobId: string;
    readonly transactionContext?: PersistenceTransactionContext;
  }): Promise<MagicItemCraftTaskView | null> {
    const repository = this.getRepository(input.transactionContext);
    const entity = await repository.findOne({ where: { jobId: input.jobId } });
    return entity ? this.toView(entity) : null;
  }

  private getRepository(transactionContext?: PersistenceTransactionContext): Repository<MagicItemCraftTaskEntity> {
    if (transactionContext) {
      return getTypeOrmEntityManager(transactionContext).getRepository(MagicItemCraftTaskEntity);
    }
    return this.magicItemCraftTaskRepository;
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
