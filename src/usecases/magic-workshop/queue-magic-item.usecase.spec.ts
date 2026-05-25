import { QueueMagicItemUsecase } from './queue-magic-item.usecase';
import type { QueueMagicItemUsecaseInput } from './queue-magic-item.usecase';

// Mock dependencies
const mockMagicItemCraftService = {
  enqueueCraft: jest.fn(),
  createTask: jest.fn(),
  findByJobId: jest.fn(),
  findByTraceId: jest.fn(),
};

const mockAsyncTaskRecordService = {
  recordEnqueued: jest.fn(),
  recordEnqueueFailed: jest.fn(),
};

describe('QueueMagicItemUsecase', () => {
  let usecase: QueueMagicItemUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new QueueMagicItemUsecase(
      mockMagicItemCraftService as any,
      mockAsyncTaskRecordService as any,
    );
  });

  describe('execute', () => {
    const baseInput: QueueMagicItemUsecaseInput = {
      itemName: '火焰戒指',
      itemType: 'WEAPON',
      materialLevel: 3,
      requestNote: '希望火焰是蓝色的',
    };

    it('成功创建制作任务并返回正确结果', async () => {
      const mockJobId = '123';
      const mockTraceId = 'trace-abc';
      const mockCreatedAt = new Date();

      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: mockJobId,
        traceId: mockTraceId,
      });

      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);

      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 1,
        jobId: mockJobId,
        traceId: mockTraceId,
        status: 'PENDING',
        itemName: '火焰戒指',
        createdAt: mockCreatedAt,
      });

      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute(baseInput);

      expect(result).toEqual({
        id: 1,
        jobId: mockJobId,
        traceId: mockTraceId,
        status: 'PENDING',
        itemName: '火焰戒指',
        createdAt: mockCreatedAt,
      });

      // 注意：enqueueCraft 内部会生成 traceId，所以验证时只检查 itemName, itemType, materialLevel 等关键字段
      expect(mockMagicItemCraftService.enqueueCraft).toHaveBeenCalledWith(
        expect.objectContaining({
          itemName: '火焰戒指',
          itemType: 'WEAPON',
          materialLevel: 3,
          requestNote: '希望火焰是蓝色的',
        }),
      );

      expect(mockMagicItemCraftService.createTask).toHaveBeenCalled();
      expect(mockAsyncTaskRecordService.recordEnqueued).toHaveBeenCalled();
    });

    it('当 enqueueCraft 失败时应记录失败并抛出错误', async () => {
      mockMagicItemCraftService.enqueueCraft.mockRejectedValue(new Error('Queue connection failed'));
      mockAsyncTaskRecordService.recordEnqueueFailed.mockResolvedValue(undefined);

      await expect(usecase.execute(baseInput)).rejects.toThrow('Queue connection failed');
      expect(mockAsyncTaskRecordService.recordEnqueueFailed).toHaveBeenCalled();
    });

    it('支持四种道具类型 - WEAPON', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '123',
        traceId: 'trace-weapon',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 1,
        jobId: '123',
        status: 'PENDING',
        itemName: '火焰剑',
        createdAt: new Date(),
      });
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute({ ...baseInput, itemType: 'WEAPON', itemName: '火焰剑' });
      expect(result.status).toBe('PENDING');
      expect(mockMagicItemCraftService.enqueueCraft).toHaveBeenCalledWith(
        expect.objectContaining({ itemType: 'WEAPON' }),
      );
    });

    it('支持四种道具类型 - TOOL', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '124',
        traceId: 'trace-tool',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 2,
        jobId: '124',
        status: 'PENDING',
        itemName: '会唱歌的茶壶',
        createdAt: new Date(),
      });
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute({ ...baseInput, itemType: 'TOOL', itemName: '会唱歌的茶壶' });
      expect(result.status).toBe('PENDING');
      expect(mockMagicItemCraftService.enqueueCraft).toHaveBeenCalledWith(
        expect.objectContaining({ itemType: 'TOOL' }),
      );
    });

    it('支持四种道具类型 - ARMOR', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '125',
        traceId: 'trace-armor',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 3,
        jobId: '125',
        status: 'PENDING',
        itemName: '隐身斗篷',
        createdAt: new Date(),
      });
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute({ ...baseInput, itemType: 'ARMOR', itemName: '隐身斗篷' });
      expect(result.status).toBe('PENDING');
      expect(mockMagicItemCraftService.enqueueCraft).toHaveBeenCalledWith(
        expect.objectContaining({ itemType: 'ARMOR' }),
      );
    });

    it('支持四种道具类型 - TOY', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '126',
        traceId: 'trace-toy',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 4,
        jobId: '126',
        status: 'PENDING',
        itemName: '魔法棒',
        createdAt: new Date(),
      });
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute({ ...baseInput, itemType: 'TOY', itemName: '魔法棒' });
      expect(result.status).toBe('PENDING');
      expect(mockMagicItemCraftService.enqueueCraft).toHaveBeenCalledWith(
        expect.objectContaining({ itemType: 'TOY' }),
      );
    });

    it('包含 actorAccountId 和 actorActiveRole', async () => {
      const inputWithActor = {
        ...baseInput,
        actorAccountId: 123,
        actorActiveRole: 'admin',
      };

      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '127',
        traceId: 'trace-actor',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue({
        id: 5,
        jobId: '127',
        status: 'PENDING',
        itemName: '测试道具',
        createdAt: new Date(),
      });
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      await usecase.execute(inputWithActor);

      expect(mockMagicItemCraftService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorAccountId: 123,
            actorActiveRole: 'admin',
          }),
        }),
      );
    });

    it('当 createTask 失败时应抛出错误', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '128',
        traceId: 'trace-create-fail',
      });
      mockMagicItemCraftService.createTask.mockRejectedValue(new Error('Database error'));

      await expect(usecase.execute(baseInput)).rejects.toThrow('Database error');
    });

    it('当 findByJobId 返回 null 时应使用 occurredAt 作为 createdAt', async () => {
      mockMagicItemCraftService.enqueueCraft.mockResolvedValue({
        jobId: '129',
        traceId: 'trace-no-task',
      });
      mockMagicItemCraftService.createTask.mockResolvedValue(undefined);
      mockMagicItemCraftService.findByJobId.mockResolvedValue(null);
      mockAsyncTaskRecordService.recordEnqueued.mockResolvedValue(undefined);

      const result = await usecase.execute(baseInput);

      expect(result.id).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
