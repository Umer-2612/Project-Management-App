import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMoM extends Document {
    title: string;
    content: string;
    attendees: string[];
    meetingDate: Date;
    projectId: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MoMSchema = new Schema<IMoM>({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    attendees: [{ type: String }],
    meetingDate: { type: Date, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

MoMSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const MoM = mongoose.model<IMoM>('MoM', MoMSchema);
