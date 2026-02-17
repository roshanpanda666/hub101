"use server";

import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import User from "@/models/User"; // Ensure User is registered
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function getExams(semester?: number, branch?: string) {
    await dbConnect();

    // Ensure model is registered
    const _ = User;

    const query: Record<string, unknown> = {};
    if (semester) query.semester = semester;
    if (branch) query.branch = branch;

    const exams = await Exam.find(query).sort({ date: 1 }).populate("createdBy", "name role").lean();
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

    // Get current user from token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let createdBy = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            createdBy = decoded.userId;
        } catch (err) {
            console.error("Invalid token in createExam", err);
        }
    }

    await Exam.create({ ...data, createdBy });
    revalidatePath("/exams");
    return { success: true };
}

export async function deleteExam(id: string) {
    await dbConnect();
    await Exam.findByIdAndDelete(id);
    revalidatePath("/exams");
    return { success: true };
}
