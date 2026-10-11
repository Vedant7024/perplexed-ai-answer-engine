import { RunnableLambda } from "@langchain/core/runnables";
import { getEmbeddings } from "../lib/gemini.js";
import { cosineSimilarity } from "./computeSimilarity.js";
import type { SearxngResult } from "../services/searxng.js";

export const rerankDocs = RunnableLambda.from(
  async (input: { query: string; docs: SearxngResult[] }) => {
    if (input.docs.length === 0) return [];
    const embeddings = getEmbeddings();
    const [queryEmbedding, docEmbeddings] = await Promise.all([
      embeddings.embedQuery(input.query),
      embeddings.embedDocuments(input.docs.map((d) => d.content || "")),
    ]);

    const scored = input.docs
      .map((doc, i) => ({
        doc,
        score: cosineSimilarity(queryEmbedding, docEmbeddings[i]),
      }))
      .sort((a, b) => b.score - a.score);

    console.log("Rerank scores:", scored.map((s) => s.score.toFixed(2)));

    // keep good matches, but never return an empty list
    const good = scored.filter((r) => r.score > 0.3);
    return (good.length ? good : scored.slice(0, 5))
      .slice(0, 5)
      .map((r) => r.doc);
  }
);

export const processDocs = RunnableLambda.from((docs: SearxngResult[]) => {
  if (docs.length === 0)
    return "NO_SOURCES: No web sources were retrieved for this message. Reply helpfully and naturally from your own knowledge (for example, greet back if the user says hello). Do not cite sources and do not say that context is missing.";
  return docs
    .map(
      (d, i) =>
        `${i + 1}. ${d.title}\n${(d.content || "").slice(0, 400)}\nURL: ${d.url}`
    )
    .join("\n\n");
});