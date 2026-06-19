// src/usecases/blog/comment.usecases.spec.ts

import { CreateCommentUsecase } from './create-comment.usecase';
import { UpdateCommentUsecase } from './update-comment.usecase';
import { ApproveCommentUsecase } from './approve-comment.usecase';
import { RejectCommentUsecase } from './reject-comment.usecase';
import { DeleteCommentUsecase } from './delete-comment.usecase';
import type { CreateCommentInput, UpdateCommentInput } from '@src/modules/blog/blog.types';
import { CommentStatus } from '@app-types/models/blog.types';

const mockBlogService = {
  createComment: jest.fn(),
  updateComment: jest.fn(),
  approveComment: jest.fn(),
  rejectComment: jest.fn(),
  deleteComment: jest.fn(),
};

const mockBlogQueryService = {
  getComments: jest.fn(),
};

const mockTransactionRunner = {
  run: jest.fn((callback: (ctx: any) => Promise<any>) => callback({})),
};

describe('Comment Use Cases', () => {
  describe('CreateCommentUsecase', () => {
    let usecase: CreateCommentUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new CreateCommentUsecase(
        mockTransactionRunner,
        mockBlogService as any,
        mockBlogQueryService as any,
      );
    });

    describe('execute', () => {
      const baseInput: CreateCommentInput = {
        postId: 1,
        authorName: 'Test Author',
        content: 'Test comment content',
      };

      it('should create a comment successfully', async () => {
        const mockComment = {
          id: 1,
          ...baseInput,
          status: CommentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createComment.mockResolvedValue(mockComment);
        mockBlogQueryService.getComments.mockResolvedValue([mockComment]);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.authorName).toBe('Test Author');
        expect(result?.content).toBe('Test comment content');
        expect(result?.status).toBe(CommentStatus.PENDING);
      });

      it('should create a comment with email and generate avatar', async () => {
        const inputWithEmail: CreateCommentInput = {
          ...baseInput,
          authorEmail: 'test@example.com',
        };

        const mockComment = {
          id: 1,
          ...inputWithEmail,
          authorAvatar:
            'https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon',
          status: CommentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createComment.mockResolvedValue(mockComment);
        mockBlogQueryService.getComments.mockResolvedValue([mockComment]);

        const result = await usecase.execute(inputWithEmail);

        expect(result?.authorEmail).toBe('test@example.com');
        expect(result?.authorAvatar).toBeDefined();
      });

      it('should create a reply comment with parentId', async () => {
        const inputWithParent: CreateCommentInput = {
          ...baseInput,
          parentId: 10,
        };

        const mockComment = {
          id: 2,
          ...inputWithParent,
          status: CommentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createComment.mockResolvedValue(mockComment);
        mockBlogQueryService.getComments.mockResolvedValue([mockComment]);

        const result = await usecase.execute(inputWithParent);

        expect(result?.parentId).toBe(10);
      });

      it('should sanitize XSS content', async () => {
        const inputWithXss: CreateCommentInput = {
          ...baseInput,
          content: '<script>alert("XSS")</script> <p>Hello</p>',
        };

        const mockComment = {
          id: 1,
          ...inputWithXss,
          content: ' <p>Hello</p>',
          status: CommentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.createComment.mockResolvedValue(mockComment);
        mockBlogQueryService.getComments.mockResolvedValue([mockComment]);

        const result = await usecase.execute(inputWithXss);

        expect(result).toBeDefined();
        expect(result?.content).not.toContain('script');
      });
    });
  });

  describe('UpdateCommentUsecase', () => {
    let usecase: UpdateCommentUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new UpdateCommentUsecase(
        mockTransactionRunner,
        mockBlogService as any,
        mockBlogQueryService as any,
      );
    });

    describe('execute', () => {
      const baseInput: UpdateCommentInput = {
        id: 1,
        content: 'Updated content',
      };

      it('should update a comment successfully', async () => {
        const mockComment = {
          id: 1,
          postId: 1,
          authorName: 'Author',
          content: 'Updated content',
          status: CommentStatus.APPROVED,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBlogService.updateComment.mockResolvedValue(mockComment);
        mockBlogQueryService.getComments.mockResolvedValue([mockComment]);

        const result = await usecase.execute(baseInput);

        expect(result?.id).toBe(1);
        expect(result?.content).toBe('Updated content');
      });

      it('should return null when comment not found', async () => {
        mockBlogService.updateComment.mockResolvedValue(null);

        const result = await usecase.execute(baseInput);

        expect(result).toBeNull();
      });
    });
  });

  describe('ApproveCommentUsecase', () => {
    let usecase: ApproveCommentUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new ApproveCommentUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      it('should approve a comment successfully', async () => {
        mockBlogService.approveComment.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
      });

      it('should return false when comment not found', async () => {
        mockBlogService.approveComment.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });
    });
  });

  describe('RejectCommentUsecase', () => {
    let usecase: RejectCommentUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new RejectCommentUsecase(mockTransactionRunner, mockBlogService as any);
    });

    describe('execute', () => {
      it('should reject a comment successfully', async () => {
        mockBlogService.rejectComment.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
      });

      it('should return false when comment not found', async () => {
        mockBlogService.rejectComment.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });
    });
  });

  describe('DeleteCommentUsecase', () => {
    let usecase: DeleteCommentUsecase;

    beforeEach(() => {
      jest.clearAllMocks();
      usecase = new DeleteCommentUsecase(mockBlogService as any);
    });

    describe('execute', () => {
      it('should delete a comment successfully', async () => {
        mockBlogService.deleteComment.mockResolvedValue(true);

        const result = await usecase.execute(1);

        expect(result).toBe(true);
      });

      it('should return false when comment not found', async () => {
        mockBlogService.deleteComment.mockResolvedValue(false);

        const result = await usecase.execute(999);

        expect(result).toBe(false);
      });
    });
  });
});
