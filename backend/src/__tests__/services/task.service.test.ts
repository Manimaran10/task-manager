import mongoose from 'mongoose';
import taskService from '../../services/task.service';
import taskRepository from '../../repositories/task.repository';
import userRepository from '../../repositories/user.repository';
import notificationRepository from '../../repositories/notification.repository';
import { TaskPriority, TaskStatus } from '../../validations/task.validation';

// Mock dependencies
jest.mock('../../repositories/task.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/notification.repository');
jest.mock('../../socket', () => ({
  io: {
    emit: jest.fn()
  }
}));

// Type assertions for mocked modules
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedTaskRepo = taskRepository as jest.Mocked<typeof taskRepository>;
const mockedNotifRepo = notificationRepository as jest.Mocked<typeof notificationRepository>;

describe('TaskService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockAssignedUserId = new mongoose.Types.ObjectId().toString();
  const mockTaskId = new mongoose.Types.ObjectId().toString();

  const mockTaskData = {
    title: 'Test Task',
    description: 'Test Description',
    dueDate: '2024-12-31',
    priority: TaskPriority.MEDIUM,
    assignedToId: mockAssignedUserId
  };

  const mockUser = {
    _id: mockAssignedUserId,
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockTask = {
    _id: mockTaskId,
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date('2024-12-31'),
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    creatorId: mockUserId,
    assignedToId: mockAssignedUserId,
    save: jest.fn(),
    toObject: () => ({})
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Mock dependencies
      mockedUserRepo.findById.mockResolvedValue(mockUser as any);
      mockedTaskRepo.create.mockResolvedValue(mockTask as any);
      mockedTaskRepo.getTaskWithDetails.mockResolvedValue(mockTask as any);

      // Execute
      const result = await taskService.createTask(mockTaskData, mockUserId);

      // Assert
      expect(mockedUserRepo.findById).toHaveBeenCalledWith(mockAssignedUserId);
      expect(mockedTaskRepo.create).toHaveBeenCalled();
      expect(mockedNotifRepo.createNotification).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw error if assigned user not found', async () => {
      // Mock dependencies
      mockedUserRepo.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(
        taskService.createTask(mockTaskData, mockUserId)
      ).rejects.toThrow('Assigned user not found');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Mock dependencies
      mockedTaskRepo.findById.mockResolvedValue(mockTask as any);
      mockedTaskRepo.update.mockResolvedValue(mockTask as any);
      mockedTaskRepo.getTaskWithDetails.mockResolvedValue(mockTask as any);

      const updateData = {
        title: 'Updated Task',
        priority: TaskPriority.HIGH
      };

      // Execute
      const result = await taskService.updateTask(mockTaskId, updateData, mockUserId);

      // Assert
      expect(mockedTaskRepo.findById).toHaveBeenCalledWith(mockTaskId);
      expect(mockedTaskRepo.update).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw error if task not found', async () => {
      // Mock dependencies
      mockedTaskRepo.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(
        taskService.updateTask(mockTaskId, {}, mockUserId)
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if user is not authorized', async () => {
      // Mock task with different creator and assignee
      const unauthorizedTask = {
        ...mockTask,
        creatorId: new mongoose.Types.ObjectId().toString(),
        assignedToId: new mongoose.Types.ObjectId().toString()
      };

      mockedTaskRepo.findById.mockResolvedValue(unauthorizedTask as any);

      // Execute & Assert
      await expect(
        taskService.updateTask(mockTaskId, {}, mockUserId)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        assignedTasks: 5,
        createdTasks: 3,
        overdueTasks: 2
      };

      const mockRecentTasks = {
        tasks: [mockTask],
        total: 1
      };

      // Mock dependencies
      mockedTaskRepo.getDashboardStats.mockResolvedValue(mockStats as any);
      mockedTaskRepo.findUserTasks.mockResolvedValue(mockRecentTasks as any);

      // Execute
      const result = await taskService.getDashboardData(mockUserId);

      // Assert
      expect(mockedTaskRepo.getDashboardStats).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        stats: mockStats,
        recentTasks: mockRecentTasks.tasks
      });
    });
  });
});