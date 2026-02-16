import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
    type: "image" | "pdf";
    url: string; // base64
    name: string;
}

export interface IAnnouncement extends Document {
    title: string;
    content: string;
    attachments: IAttachment[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
    {
        type: { type: String, enum: ["image", "pdf"], required: true },
        url: { type: String, required: true },
        name: { type: String, required: true },
    },
    { _id: false }
);

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        attachments: [AttachmentSchema],
        author: { type: String, required: true },
    },
    { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
    mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
