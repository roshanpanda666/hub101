import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const resource = await Resource.findById(id).select("file_name file_data");
        if (!resource) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const buffer = Buffer.from(resource.file_data, "base64");

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${resource.file_name}"`,
                "Content-Length": buffer.length.toString(),
            },
        });
    } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
