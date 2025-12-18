import mongoose, { Schema, Document, Types } from 'mongoose';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_OVERDUE = 'task_overdue'
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  taskId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  message: {
    type: String,
    required: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);