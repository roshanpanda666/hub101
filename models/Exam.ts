import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExam extends Document {
    semester: number;
    subject: string;
    date: Date;
    type: "Mid-Sem" | "End-Sem";
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
    },
    { timestamps: true }
);

const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
