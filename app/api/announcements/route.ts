import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";

export async function GET() {
    try {
        await dbConnect();
        const announcements = await Announcement.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Failed to fetch announcements:", error);
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { title, content, attachments, author } = body;

        if (!title || !content || !author) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newAnnouncement = await Announcement.create({
            title,
            content,
            attachments: attachments || [],
            author,
        });

        return NextResponse.json(newAnnouncement, { status: 201 });
    } catch (error) {
        console.error("Failed to create announcement:", error);
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
}
