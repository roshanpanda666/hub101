import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Announcement from "@/models/Announcement";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const deleted = await Announcement.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete announcement:", error);
        return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
    }
}
