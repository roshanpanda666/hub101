import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        await dbConnect();

        // Create resource with embedded file data
        const resource = await Resource.create({
            type: formData.get("type") as string,
            branch: formData.get("branch") as string,
            semester: Number(formData.get("semester")),
            subject_name: formData.get("subject_name") as string,
            file_name: file.name,
            file_data: base64,
            uploaded_by: (formData.get("uploaded_by") as string) || "anonymous",
            is_approved: false,
        });

        return NextResponse.json({
            success: true,
            resource_id: resource._id.toString(),
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
