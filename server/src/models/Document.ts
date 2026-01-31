import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocument extends Document {
    title: string;
    content: string;
    projectId: Types.ObjectId;
    createdBy: Types.ObjectId;
    lastUpdatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

DocumentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const WikiDocument = mongoose.model<IDocument>('Document', DocumentSchema);
