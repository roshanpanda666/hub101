import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "admin" | "developer" | "cr" | "hod";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String }, // Optional for OAuth users, required for credentials
        role: {
            type: String,
            enum: ["user", "admin", "developer", "cr", "hod"],
            default: "user",
        },
    },
    { timestamps: true }
);

// Force overwrite of model if it exists to ensure new schema fields (like role) are picked up
if (mongoose.models.User) {
    delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
