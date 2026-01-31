import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRetrospective extends Document {
    sprintId: Types.ObjectId;
    wentWell: string[];
    didntGoWell: string[];
    actionItems: string[];
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RetrospectiveSchema = new Schema<IRetrospective>({
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint', required: true, unique: true },
    wentWell: [{ type: String }],
    didntGoWell: [{ type: String }],
    actionItems: [{ type: String }],
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

RetrospectiveSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const Retrospective = mongoose.model<IRetrospective>('Retrospective', RetrospectiveSchema);
