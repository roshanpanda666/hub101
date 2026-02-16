import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AuthResult {
    user?: IUser;
    error?: string;
    status?: number;
}

export async function verifyAdmin(req: NextRequest): Promise<AuthResult> {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return { error: "Not authenticated", status: 401 };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
        await dbConnect();

        const user = await User.findById(decoded.userId);
        if (!user) {
            return { error: "User not found", status: 404 };
        }

        const adminRoles = ["admin", "developer", "cr", "hod"];
        if (!adminRoles.includes(user.role)) {
            return { error: "Unauthorized access", status: 403 };
        }

        return { user };
    } catch (error) {
        return { error: "Invalid token", status: 401 };
    }
}
