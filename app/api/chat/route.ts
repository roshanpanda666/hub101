import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Routine from "@/models/Routine";
import Exam from "@/models/Exam";
import Resource from "@/models/Resource";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_KEY;

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        await dbConnect();
        const lower = message.toLowerCase();

        // --- Structured Query: Routine ---
        if (lower.includes("class") || lower.includes("routine") || lower.includes("schedule")) {
            const sectionMatch = message.match(/([A-Z]{2,4}-\d)/i);
            const semMatch = message.match(/semester\s*(\d)/i);

            if (sectionMatch || semMatch) {
                const query: Record<string, unknown> = {};
                if (sectionMatch) query.section = sectionMatch[1].toUpperCase();
                if (semMatch) query.semester = Number(semMatch[1]);

                const routines = await Routine.find(query).lean();
                if (routines.length > 0) {
                    const r = routines[0];
                    const scheduleText = r.schedule
                        .map((d) => `**${d.day}**: ${d.classes.map((c) => `${c.time} - ${c.subject} (${c.room})`).join(", ")}`)
                        .join("\n");
                    return NextResponse.json({
                        reply: `Here's the schedule for ${r.section} (Semester ${r.semester}):\n\n${scheduleText}`,
                    });
                }
            }
        }

        // --- Structured Query: Exam ---
        if (lower.includes("exam") || lower.includes("mid-sem") || lower.includes("end-sem")) {
            const semMatch = message.match(/semester\s*(\d)/i);
            const query: Record<string, unknown> = {};
            if (semMatch) query.semester = Number(semMatch[1]);

            const exams = await Exam.find(query).sort({ date: 1 }).lean();
            if (exams.length > 0) {
                const examText = exams
                    .map((e) => `• **${e.subject}** — ${new Date(e.date).toLocaleDateString("en-IN", { dateStyle: "medium" })} (${e.type})`)
                    .join("\n");
                return NextResponse.json({ reply: `Upcoming exams:\n\n${examText}` });
            }
        }

        // --- Gemini AI for general questions ---
        if (GEMINI_KEY) {
            try {
                // Gather context from resources
                const resources = await Resource.find({ is_approved: true })
                    .select("type branch semester subject_name")
                    .limit(20)
                    .lean();

                const resourceContext = resources.length > 0
                    ? `Available resources: ${resources.map((r) => `${r.subject_name} (${r.type}, ${r.branch} Sem ${r.semester})`).join("; ")}`
                    : "No resources uploaded yet.";

                const genAI = new GoogleGenerativeAI(GEMINI_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                // Fetch dynamic prompt
                let systemInstruction = `You are CPGS Hub AI, an academic assistant for university students. You help with questions about syllabi, exams, routines, and general academic queries. Be concise and helpful.`;

                try {
                    const SystemConfig = (await import("@/models/SystemConfig")).default;
                    const config = await SystemConfig.findOne({ key: "ai_prompt" });
                    if (config?.value) systemInstruction = config.value;
                } catch (e) {
                    console.error("Failed to load system prompt", e);
                }

                const prompt = `${systemInstruction}
                
Context:
${resourceContext}

Student question: ${message}

Answer concisely:`;

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                return NextResponse.json({ reply: text });
            } catch (aiError: any) {
                console.error("Gemini error:", aiError);
                return NextResponse.json({ reply: `(Debug) Gemini Error: ${aiError.message}` });
            }
        }

        // --- Fallback ---
        return NextResponse.json({
            reply: "🤖 I'm the CPGS Hub AI! I can help with class routines and exam schedules. Try asking:\n\n• \"What's the routine for CSA-1 semester 5?\"\n• \"When are the semester 5 exams?\"\n\n_Full AI-powered answers are available when the Gemini API is configured._",
        });
    } catch (error: any) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}
