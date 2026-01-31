import mongoose, { Schema, Document, Types } from 'mongoose';

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface ISprint extends Document {
    name: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
    projectId: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed'],
        default: 'planning'
    },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

SprintSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);
