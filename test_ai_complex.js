require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const modelName = "gemini-2.5-flash";
  console.log(`Testing model: ${modelName} with complex prompt`);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  const systemInstruction = `You are Campus Hub AI, an academic assistant for university students. You help with questions about syllabi, exams, routines, and general academic queries. Be concise and helpful.`;
  const resourceContext = "Available resources: Algorithms (Notes, CSE Sem 5); OS (Book, CSE Sem 5)";
  const message = "What resources do we have for CSE?";

  const prompt = `${systemInstruction}
                
Context:
${resourceContext}

Student question: ${message}

Answer concisely:`;

  try {
    const result = await model.generateContent(prompt);
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error full details:", JSON.stringify(e, null, 2));
    console.error("Error message:", e.message);
  }
}
test();
