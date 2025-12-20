import taskRepository from '../repositories/task.repository';
import notificationRepository from '../repositories/notification.repository';
import userRepository from '../repositories/user.repository';
import { Types } from 'mongoose';
import { TaskPriority, TaskStatus } from '../validations/task.validation';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../validations/task.validation';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { NotificationType } from '../models/Notification';
import { getIO } from '../socket';

export class TaskService {
  async createTask(data: CreateTaskDto, creatorId: string) {
    const dueDate = new Date(data.dueDate);
    
    // Check if assigned user exists
    const assignedUser = await userRepository.findById(data.assignedToId);
    if (!assignedUser) {
      throw new NotFoundError('Assigned user not found');
    }

    const taskData = {
      ...data,
      dueDate,
      creatorId: new Types.ObjectId(creatorId),
      assignedToId: new Types.ObjectId(data.assignedToId)
    };

    const task = await taskRepository.create(taskData);

    // Create notification for assigned user
    const creator = await userRepository.findById(creatorId);
    await notificationRepository.createNotification({
      userId: new Types.ObjectId(data.assignedToId),
      type: NotificationType.TASK_ASSIGNED,
      message: `${creator?.name} assigned a new task to you: "${data.title}"`,
      taskId: task._id
    });

    const taskWithDetails = await taskRepository.getTaskWithDetails(task._id.toString());
    // const { getIO } = await import('../socket');
    const io = getIO();
    io.emit('task:created', taskWithDetails);
    // Notify assigned user
    io.to(`user:${data.assignedToId}`).emit('task:assigned', {
    task: taskWithDetails,
    assignedBy: creator?.name,
    timestamp: new Date(),
  });

    return await taskRepository.getTaskWithDetails(task._id.toString());
  }

  async getTasks(userId: string, query: TaskQueryDto) {
    const filters: any = {};

    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;

    return await taskRepository.findUserTasks(userId, filters, {
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit
    });
  }

  async getTask(taskId: string, userId: string) {
    const task = await taskRepository.getTaskWithDetails(taskId);
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access to this task
    if (
      task.creatorId._id.toString() !== userId &&
      task.assignedToId._id.toString() !== userId
    ) {
      throw new ForbiddenError('Access denied');
    }

    return task;
  }

  async updateTask(taskId: string, data: UpdateTaskDto, userId: string) {
    const task = await taskRepository.findById(taskId);
    
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    // Check if user can update the task
    if (
      task.creatorId.toString() !== userId.toString() &&
      task.assignedToId.toString() !== userId.toString()
    ) {
          console.log('❌ ACCESS DENIED - User is neither creator nor assignee');
      throw new ForbiddenError('Access denied');
    }

    const updateData: any = { ...data };
    
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    // Check if assignee changed
    let newAssigneeId: string | null = null;
    if (data.assignedToId && data.assignedToId !== task.assignedToId.toString()) {
      // Verify new assignee exists
      const newAssignee = await userRepository.findById(data.assignedToId);
      if (!newAssignee) {
        throw new NotFoundError('New assignee not found');
      }
      newAssigneeId = data.assignedToId;
      updateData.assignedToId = new Types.ObjectId(data.assignedToId);
    }

    const updatedTask = await taskRepository.update(taskId, { $set: updateData });
    
    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    // Create notification if assignee changed
    if (newAssigneeId) {
      const updater = await userRepository.findById(userId);
      await notificationRepository.createNotification({
        userId: new Types.ObjectId(newAssigneeId),
        type: NotificationType.TASK_ASSIGNED,
        message: `${updater?.name} assigned a task to you: "${task.title}"`,
        taskId: task._id
      });
    }

    // Emit real-time update
    const taskWithDetails = await taskRepository.getTaskWithDetails(taskId);
    const io = getIO();
    io.emit('task:updated', taskWithDetails);
      // Notify new assignee if changed
    if (newAssigneeId) {
    const updater = await userRepository.findById(userId);
    io.to(`user:${newAssigneeId}`).emit('task:assigned', {
      task: taskWithDetails,
      assignedBy: updater?.name,
      timestamp: new Date(),
    });
  }

    return taskWithDetails;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await taskRepository.findById(taskId);
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only creator can delete the task
    if (task.creatorId.toString() !== userId.toString()) {
      throw new ForbiddenError('Only the creator can delete this task');
    }

    await taskRepository.delete(taskId);
    
    // Emit real-time update
    const { getIO } = await import('../socket');
    const io = getIO();
    io.emit('task:deleted', { taskId });

    return { message: 'Task deleted successfully' };
  }

  async getDashboardData(userId: string) {
    const stats = await taskRepository.getDashboardStats(userId);
    
    const recentTasks = await taskRepository.findUserTasks(userId, {}, {
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    return {
      ...stats,
      recentTasks: recentTasks.tasks
    };
  }

  async getAssignedTasks(userId: string) {
    return await taskRepository.findUserTasks(userId, { assigned: true });
  }

  async getCreatedTasks(userId: string) {
    return await taskRepository.findUserTasks(userId, { created: true });
  }

  async getOverdueTasks(userId: string) {
    return await taskRepository.findUserTasks(userId, { overdue: true });
  }
}

export default new TaskService();