import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SystemConfig from "@/models/SystemConfig";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    // Public or Admin? Let's make it admin-only for now, regular users don't need to see the raw prompt
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        await dbConnect();

        if (key) {
            const config = await SystemConfig.findOne({ key });
            return NextResponse.json({ success: true, value: config ? config.value : null });
        } else {
            const configs = await SystemConfig.find({});
            return NextResponse.json({ success: true, configs });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        const { key, value } = await req.json();

        if (!key || !value) return NextResponse.json({ error: "Key and Value required" }, { status: 400 });

        await dbConnect();
        const config = await SystemConfig.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
