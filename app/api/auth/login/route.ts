import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        console.log(`[LOGIN DEBUG] Attempting login for email: ${email}`);

        if (!email || !password) {
            console.log("[LOGIN DEBUG] Missing email or password");
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`[LOGIN DEBUG] User not found for email: ${email}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log(`[LOGIN DEBUG] User found: ${user._id}, checking password...`);

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log(`[LOGIN DEBUG] Password mismatch for user: ${user._id}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log(`[LOGIN DEBUG] Password matched for user: ${user._id}, generating token...`);

        const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

        const response = NextResponse.json({
            user: { _id: user._id, name: user.name, email: user.email },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        console.log(`[LOGIN DEBUG] Login successful for user: ${user._id}`);

        return response;
    } catch (error) {
        console.error("[LOGIN DEBUG] Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
