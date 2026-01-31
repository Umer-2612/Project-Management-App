import { Activity, ActivityAction } from '../models/index.js';
import { Types } from 'mongoose';

interface LogActivityParams {
    action: ActivityAction;
    entityType: 'task' | 'sprint' | 'project' | 'document' | 'mom';
    entityId: Types.ObjectId | string;
    entityName: string;
    projectId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    details?: string;
    previousValue?: string;
    newValue?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
    try {
        const activity = new Activity({
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            entityName: params.entityName,
            projectId: params.projectId,
            userId: params.userId,
            details: params.details,
            previousValue: params.previousValue,
            newValue: params.newValue,
        });
        await activity.save();
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - activity logging should not break the main operation
    }
}
