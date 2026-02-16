import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
    type: "syllabus" | "pyq" | "notes";
    branch: string;
    semester: number;
    subject_name: string;
    file_name: string;
    file_data: string; // base64-encoded PDF
    uploaded_by: string;
    is_approved: boolean;
    vector_id?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
    {
        type: {
            type: String,
            enum: ["syllabus", "pyq", "notes"],
            required: true,
        },
        branch: { type: String, required: true },
        semester: { type: Number, required: true },
        subject_name: { type: String, required: true },
        file_name: { type: String, required: true },
        file_data: { type: String, required: true },
        uploaded_by: { type: String, default: "anonymous" },
        is_approved: { type: Boolean, default: false },
        vector_id: { type: String },
    },
    { timestamps: true }
);

const Resource: Model<IResource> =
    mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;
