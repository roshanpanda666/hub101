import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExam extends Document {
    semester: number;
    subject: string;
    date: Date;
    type: "Mid-Sem" | "End-Sem";
    branch: string;
    time?: string;
    venue?: string;
    isNotice?: boolean;
    imageUrl?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
    {
        semester: { type: Number, required: true },
        subject: { type: String, required: true },
        date: { type: Date, required: true },
        type: {
            type: String,
            enum: ["Mid-Sem", "End-Sem"],
            required: true,
        },
        branch: { type: String, required: true },
        time: { type: String },
        venue: { type: String },
        isNotice: { type: Boolean, default: false },
        imageUrl: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Store User ID
    },
    { timestamps: true }
);

const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
