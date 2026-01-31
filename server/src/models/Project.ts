import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProjectSchema.pre('save', function (next: any) {
    this.updatedAt = new Date();
    next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
