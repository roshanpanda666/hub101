import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SystemConfig from "@/models/SystemConfig";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    // Public or Admin? Let's make it admin-only for now, regular users don't need to see the raw prompt
    // However, for the CMS features, the frontend needs to fetch this data.
    // So we should allow public access to 'site_identity', 'home_content', and 'admin_message', 'theme_config'
    // But 'ai_prompt' should remain protected.

    // We can check the key param.
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        // Listing all configs -> Admin only
        const auth = await verifyAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        await dbConnect();
        const configs = await SystemConfig.find({});
        return NextResponse.json({ success: true, configs });
    }

    // Specific key
    const publicKeys = ["site_identity", "home_content", "admin_message", "theme_config"];

    if (!publicKeys.includes(key)) {
        const auth = await verifyAdmin(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await dbConnect();
        const config = await SystemConfig.findOne({ key });
        return NextResponse.json({ success: true, value: config ? config.value : null });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = auth.user!;

    try {
        const { key, value } = await req.json();

        if (!key || (value === undefined)) return NextResponse.json({ error: "Key and Value required" }, { status: 400 });

        let finalValue = value;

        // If updating admin message, append author info
        if (key === "admin_message") {
            const messageData = JSON.parse(value);
            messageData.authorName = user.name;
            messageData.authorRole = user.role;
            messageData.updatedAt = new Date().toISOString();
            finalValue = JSON.stringify(messageData);
        }

        // If updating theme, append metadata
        if (key === "theme_config") {
            const themeData = JSON.parse(value);
            themeData._metadata = {
                updatedBy: user.name,
                role: user.role,
                updatedAt: new Date().toISOString()
            };
            finalValue = JSON.stringify(themeData);
        }

        await dbConnect();
        const config = await SystemConfig.findOneAndUpdate(
            { key },
            { value: finalValue },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Revalidate to ensure changes (like theme or app name) are reflected immediately
        // especially for the RootLayout and public pages
        if (key === "theme_config" || key === "site_identity") {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/", "layout");
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}

