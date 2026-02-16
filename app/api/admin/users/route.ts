import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        await dbConnect();
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        await dbConnect();
        await User.findByIdAndDelete(userId);

        return NextResponse.json({ success: true, message: "User deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { userId, role } = await req.json();

        if (!userId || !role) return NextResponse.json({ error: "User ID and Role required" }, { status: 400 });

        const validRoles = ["user", "admin", "developer", "cr", "hod"];
        if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

        await dbConnect();
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
    }
}
