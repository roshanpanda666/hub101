"use server";

import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { revalidatePath } from "next/cache";

/* ---------- READ ---------- */

export async function getResources(filters: {
    branch?: string;
    semester?: number;
    type?: string;
    approvedOnly?: boolean;
}) {
    await dbConnect();

    const query: Record<string, unknown> = {};
    if (filters.branch) query.branch = filters.branch;
    if (filters.semester) query.semester = filters.semester;
    if (filters.type) query.type = filters.type;
    if (filters.approvedOnly !== false) query.is_approved = true;

    // Exclude file_data from list queries (it can be huge)
    const resources = await Resource.find(query)
        .select("-file_data")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(resources));
}

export async function getPendingResources() {
    await dbConnect();
    const resources = await Resource.find({ is_approved: false })
        .select("-file_data")
        .sort({ createdAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(resources));
}

/* ---------- ADMIN ---------- */

export async function approveResource(id: string) {
    await dbConnect();
    await Resource.findByIdAndUpdate(id, { is_approved: true });
    revalidatePath("/browse");
    revalidatePath("/admin");
    return { success: true };
}

export async function deleteResource(id: string) {
    await dbConnect();
    await Resource.findByIdAndDelete(id);
    revalidatePath("/browse");
    revalidatePath("/admin");
    return { success: true };
}
