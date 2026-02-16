require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const modelName = "gemini-2.5-flash";
  console.log(`Testing model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });
  try {
    const result = await model.generateContent("Hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
    if (e.message.includes("404") || e.message.includes("not found")) {
        console.log("\nIt seems the model name is invalid.");
    }
  }
}
test();
