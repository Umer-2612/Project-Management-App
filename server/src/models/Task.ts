import mongoose, { Schema, Document, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface ITask extends Document {
    title: string;
    description: string;
    acceptanceCriteria: string;
    estimatedTime: number;
    actualTime: number;
    status: TaskStatus;
    assignees: Types.ObjectId[];
    reviewers: Types.ObjectId[];
    tags: string[];
    projectId: Types.ObjectId;
    sprintId?: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    acceptanceCriteria: { type: String, default: '' },
    estimatedTime: { type: Number, default: 0 },
    actualTime: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
