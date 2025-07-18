import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function geminiChat(system, userPrompt) {
  /* 1.5‑flash = cheapest / fastest; switch to 1.5‑pro if you need deeper output */
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([system, userPrompt]);
  const resp = await result.response;
  return resp.text();
}
