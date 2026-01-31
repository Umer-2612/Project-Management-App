import mongoose, { Schema, Document, Types } from 'mongoose';

export type ActivityAction =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'status_changed'
    | 'assigned'
    | 'unassigned'
    | 'moved_to_sprint'
    | 'moved_to_backlog'
    | 'commented';

export interface IActivity extends Document {
    action: ActivityAction;
    entityType: 'task' | 'sprint' | 'project' | 'document' | 'mom';
    entityId: Types.ObjectId;
    entityName: string;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    details?: string;
    previousValue?: string;
    newValue?: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'deleted', 'status_changed', 'assigned', 'unassigned', 'moved_to_sprint', 'moved_to_backlog', 'commented']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['task', 'sprint', 'project', 'document', 'mom']
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityName: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
ActivitySchema.index({ projectId: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
