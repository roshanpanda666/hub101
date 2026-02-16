import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Check if user has an admin-level role
        const adminRoles = ["admin", "developer", "cr", "hod"];
        // Ensure role exists and is string
        const userRole = user.role ? String(user.role) : "";

        if (!adminRoles.includes(userRole)) {
            return NextResponse.json({ error: `Unauthorized access (Role: ${userRole})` }, { status: 403 });
        }

        const match = await bcrypt.compare(password, user.password || "");

        if (!match) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" } // Admin session shorter/different if needed
        );

        const response = NextResponse.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        // Set a duplicate cookie specifically for admin if needed,
        // or just reuse the main token. For this implementation, we'll reuse 'token'
        // but the middleware will check the role inside it.
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Admin Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
