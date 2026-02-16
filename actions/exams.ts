"use server";

import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import { revalidatePath } from "next/cache";

export async function getExams(semester?: number, branch?: string) {
    await dbConnect();

    const query: Record<string, unknown> = {};
    if (semester) query.semester = semester;
    if (branch) query.branch = branch;

    const exams = await Exam.find(query).sort({ date: 1 }).lean();
    return JSON.parse(JSON.stringify(exams));
}

export async function createExam(data: {
    semester: number;
    subject: string;
    date: string;
    type: "Mid-Sem" | "End-Sem";
    branch: string;
    time?: string;
    venue?: string;
    isNotice?: boolean;
    imageUrl?: string;
}) {
    await dbConnect();
    await Exam.create(data);
    revalidatePath("/exams");
    return { success: true };
}

export async function deleteExam(id: string) {
    await dbConnect();
    await Exam.findByIdAndDelete(id);
    revalidatePath("/exams");
    return { success: true };
}
