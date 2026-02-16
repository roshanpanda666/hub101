import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        await dbConnect();
        const resources = await Resource.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, resources });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(req.url);
        const resourceId = searchParams.get("id");

        if (!resourceId) return NextResponse.json({ error: "Resource ID required" }, { status: 400 });

        await dbConnect();
        await Resource.findByIdAndDelete(resourceId);

        return NextResponse.json({ success: true, message: "Resource deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { resourceId, is_approved } = await req.json();

        if (!resourceId || is_approved === undefined) {
            return NextResponse.json({ error: "Resource ID and Approval status required" }, { status: 400 });
        }

        await dbConnect();
        const updatedResource = await Resource.findByIdAndUpdate(resourceId, { is_approved }, { new: true });

        return NextResponse.json({ success: true, resource: updatedResource });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
    }
}
