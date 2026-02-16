import mongoose, { Schema, Document, Model } from "mongoose";

interface IClass {
    time: string;
    subject: string;
    room: string;
}

interface IScheduleDay {
    day: string;
    classes: IClass[];
}

export interface IRoutine extends Document {
    section: string;
    semester: number;
    schedule: IScheduleDay[];
    createdAt: Date;
    updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
    {
        time: { type: String, required: true },
        subject: { type: String, required: true },
        room: { type: String, required: true },
    },
    { _id: false }
);

const ScheduleDaySchema = new Schema<IScheduleDay>(
    {
        day: { type: String, required: true },
        classes: [ClassSchema],
    },
    { _id: false }
);

const RoutineSchema = new Schema<IRoutine>(
    {
        section: { type: String, required: true },
        semester: { type: Number, required: true },
        schedule: [ScheduleDaySchema],
    },
    { timestamps: true }
);

const Routine: Model<IRoutine> =
    mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema);

export default Routine;
