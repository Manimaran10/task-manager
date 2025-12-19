import mongoose, { Schema, Document, Types } from 'mongoose';

// Import from validation instead of defining here
import { TaskPriority, TaskStatus } from '../validations/task.validation';

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: Types.ObjectId;
  assignedToId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isOverdue: boolean;
}

const TaskSchema: Schema<ITask> = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedToId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
TaskSchema.index({ assignedToId: 1, status: 1 });
TaskSchema.index({ creatorId: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ priority: 1 });

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function(this: ITask) {
  return this.dueDate < new Date() && this.status !== TaskStatus.COMPLETED;
});

export default mongoose.model<ITask>('Task', TaskSchema);