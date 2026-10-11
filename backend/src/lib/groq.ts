import { ChatGroq } from "@langchain/groq";

export function getLLM(temperature = 0.4) {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature,
    maxRetries: 5,
  });
}