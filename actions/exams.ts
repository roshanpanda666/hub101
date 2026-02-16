"use server";

import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import { revalidatePath } from "next/cache";

export async function getExams(semester?: number) {
    await dbConnect();

    const query: Record<string, unknown> = {};
    if (semester) query.semester = semester;

    const exams = await Exam.find(query).sort({ date: 1 }).lean();
    return JSON.parse(JSON.stringify(exams));
}

export async function createExam(data: {
    semester: number;
    subject: string;
    date: string;
    type: "Mid-Sem" | "End-Sem";
}) {
    await dbConnect();
    await Exam.create(data);
    revalidatePath("/exams");
    return { success: true };
}
