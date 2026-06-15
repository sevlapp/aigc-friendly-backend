// src/usecases/blog/queue-comment-email-notification.usecase.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BlogQueueService } from '@src/modules/blog/blog-queue/blog-queue.service';
import { QueueCommentEmailNotificationUsecase } from './queue-comment-email-notification.usecase';

describe('QueueCommentEmailNotificationUsecase', () => {
  let usecase: QueueCommentEmailNotificationUsecase;
  let blogQueueService: jest.Mocked<BlogQueueService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueCommentEmailNotificationUsecase,
        {
          provide: BlogQueueService,
          useValue: {
            enqueueCommentEmailNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<QueueCommentEmailNotificationUsecase>(QueueCommentEmailNotificationUsecase);
    blogQueueService = module.get(BlogQueueService);
  });

  it('成功入队评论邮件通知', async () => {
    const input = {
      commentId: 'comment-123',
      postId: 'post-456',
      authorEmail: 'test@example.com',
      authorName: 'Test User',
      postTitle: 'Test Post',
      commentContent: 'Test comment',
    };

    const expectedResult = {
      jobId: 'job-789',
      traceId: 'trace-abc',
    };

    blogQueueService.enqueueCommentEmailNotification.mockResolvedValue(expectedResult);

    const result = await usecase.execute(input);

    expect(result).toEqual(expectedResult);
    expect(blogQueueService.enqueueCommentEmailNotification).toHaveBeenCalledWith(input);
  });

  it('支持 dedupKey 和 traceId', async () => {
    const input = {
      commentId: 'comment-123',
      postId: 'post-456',
      authorEmail: 'test@example.com',
      authorName: 'Test User',
      postTitle: 'Test Post',
      commentContent: 'Test comment',
      dedupKey: 'dedup-key',
      traceId: 'trace-xyz',
    };

    const expectedResult = {
      jobId: 'job-789',
      traceId: 'trace-xyz',
    };

    blogQueueService.enqueueCommentEmailNotification.mockResolvedValue(expectedResult);

    const result = await usecase.execute(input);

    expect(result.traceId).toBe('trace-xyz');
    expect(blogQueueService.enqueueCommentEmailNotification).toHaveBeenCalledWith(input);
  });

  it('队列服务抛出错误时应该传播', async () => {
    const input = {
      commentId: 'comment-123',
      postId: 'post-456',
      authorEmail: 'test@example.com',
      authorName: 'Test User',
      postTitle: 'Test Post',
      commentContent: 'Test comment',
    };

    const error = new Error('Queue error');
    blogQueueService.enqueueCommentEmailNotification.mockRejectedValue(error);

    await expect(usecase.execute(input)).rejects.toThrow('Queue error');
  });
});