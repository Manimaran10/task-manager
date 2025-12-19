import Task, { ITask } from '../models/Tasks';
import { TaskPriority, TaskStatus } from '../validations/task.validation';
import { BaseRepository } from './base.repository';
import { Types } from 'mongoose';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  async findUserTasks(
    userId: string,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assigned?: boolean;
      created?: boolean;
      overdue?: boolean;
    },
    options: {
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ tasks: ITask[]; total: number }> {
    const query: any = { $or: [] };

    if (filters.assigned) {
      query.$or.push({ assignedToId: new Types.ObjectId(userId) });
    }

    if (filters.created) {
      query.$or.push({ creatorId: new Types.ObjectId(userId) });
    }

    // If no specific filter, show all tasks user is involved in
    if (!query.$or.length) {
      query.$or = [
        { assignedToId: new Types.ObjectId(userId) },
        { creatorId: new Types.ObjectId(userId) }
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.overdue) {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: TaskStatus.COMPLETED };
    }

    // Sorting
    const sort: any = {};
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.dueDate = 1; // Default sort by due date ascending
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.model.find(query)
        .populate('creatorId', 'name email')
        .populate('assignedToId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.count(query)
    ]);

    return { tasks, total };
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: Partial<ITask>
  ): Promise<ITask | null> {
    const task = await this.findById(taskId);
    
    if (!task) {
      return null;
    }

    // Check if user can update the task
    if (
      task.creatorId.toString() !== userId &&
      task.assignedToId.toString() !== userId
    ) {
      throw new Error('Unauthorized to update this task');
    }

    return await this.update(taskId, { $set: data });
  }

  async getTaskWithDetails(taskId: string): Promise<ITask | null> {
    return await this.model.findById(taskId)
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email');
  }

  // async getDashboardStats(userId: string) {
  //   const assignedTasks = await this.count({
  //     assignedToId: new Types.ObjectId(userId),
  //     status: { $ne: TaskStatus.COMPLETED }
  //   });

  //   const createdTasks = await this.count({
  //     creatorId: new Types.ObjectId(userId),
  //     status: { $ne: TaskStatus.COMPLETED }
  //   });

  //   const overdueTasks = await this.count({
  //     assignedToId: new Types.ObjectId(userId),
  //     dueDate: { $lt: new Date() },
  //     status: { $ne: TaskStatus.COMPLETED }
  //   });

  //   return {
  //     assignedTasks,
  //     createdTasks,
  //     overdueTasks
  //   };
  // }
  async getDashboardStats(userId: string) {
  const userIdObj = new Types.ObjectId(userId);
  
  // Get all counts in parallel for efficiency
  const [
    assignedTasks,
    createdTasks,
    overdueTasks,
    totalTasks,
    inProgressTasks,
    completedTasks
  ] = await Promise.all([
    // Assigned tasks (excluding completed)
    this.count({
      assignedToId: userIdObj,
      status: { $ne: TaskStatus.COMPLETED }
    }),
    
    // Created tasks (excluding completed)
    this.count({
      creatorId: userIdObj,
      status: { $ne: TaskStatus.COMPLETED }
    }),
    
    // Overdue tasks
    this.count({
      assignedToId: userIdObj,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED }
    }),
    
    // Total tasks user is involved in
    this.count({
      $or: [
        { assignedToId: userIdObj },
        { creatorId: userIdObj }
      ]
    }),
    
    // In progress tasks
    this.count({
      assignedToId: userIdObj,
      status: TaskStatus.IN_PROGRESS
    }),
    
    // Completed tasks
    this.count({
      $or: [
        { assignedToId: userIdObj },
        { creatorId: userIdObj }
      ],
      status: TaskStatus.COMPLETED
    })
  ]);

  // Calculate completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return {
    assignedTasks,
    createdTasks,
    overdueTasks,
    totalTasks,
    inProgressTasks,
    completedTasks,
    completionRate
  };
}
}

export default new TaskRepository();