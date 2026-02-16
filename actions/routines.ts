"use server";

import dbConnect from "@/lib/dbConnect";
import Routine from "@/models/Routine";
import { revalidatePath } from "next/cache";

export async function getRoutine(section?: string, semester?: number) {
    await dbConnect();

    const query: Record<string, unknown> = {};
    if (section) query.section = section;
    if (semester) query.semester = semester;

    const routines = await Routine.find(query).lean();
    return JSON.parse(JSON.stringify(routines));
}

export async function getAllRoutines() {
    await dbConnect();
    const routines = await Routine.find().sort({ semester: 1, section: 1 }).lean();
    return JSON.parse(JSON.stringify(routines));
}

export async function createRoutine(data: {
    section: string;
    semester: number;
    schedule: { day: string; classes: { time: string; subject: string; room: string }[] }[];
}) {
    await dbConnect();
    await Routine.create(data);
    revalidatePath("/routine");
    return { success: true };
}

export async function deleteRoutine(id: string) {
    await dbConnect();
    await Routine.findByIdAndDelete(id);
    revalidatePath("/routine");
    return { success: true };
}
