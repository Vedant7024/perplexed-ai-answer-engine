import { EventEmitter } from "events";
import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage } from "@langchain/core/messages";
import { getLLM } from "../lib/groq.js";
import {
  searchSearxng,
  SearxngResult,
} from "../services/searxng.js";
import {
  rerankDocs,
  processDocs,
} from "../utils/rerankDocs.js";
import { formatChatHistoryAsString } from "../utils/formatHistory.js";
import { handleStream } from "../utils/handleStream.js";

const webSearchRetrieverPrompt = PromptTemplate.fromTemplate(
  `You are an assistant that rewrites a user's question into a standalone web search query, using the chat history for context. If the question is a greeting or needs no search, respond with exactly "not_needed".

Example:
Follow up question: Who won the last World Cup?
Rephrased: latest FIFA World Cup winner

Example:
Follow up question: What's the weather like in Tokyo?
Rephrased: Tokyo weather forecast

Example:
Follow up question: hi there
Rephrased: not_needed

Chat history:
{chat_history}

Follow up question: {query}
Rephrased:`
);

const webResponsePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful AI search assistant. If the context below contains numbered sources, answer using them and cite inline as [1], [2] matching the list. If the context says NO_SOURCES (for example for greetings or casual chat), reply naturally from your own knowledge with no citations. If sources exist but don't fully cover the question, say what is missing, then give your best general answer and make clear that part is not from the sources.\n\nContext:\n{context}",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{query}"],
]);

function createBasicWebSearchRetrieverChain() {
  return RunnableSequence.from([
    webSearchRetrieverPrompt,
    getLLM(0.3),
    new StringOutputParser(),

    RunnableLambda.from(async (rephrased: string) => {
      const searchQuery = rephrased.trim();

      console.log("Rephrased search query:", searchQuery);

      // No web search needed for greetings/simple questions
      if (
        searchQuery.toLowerCase() === "not_needed" ||
        !searchQuery
      ) {
        console.log("Search not needed.");

        return {
          query: searchQuery,
          docs: [] as SearxngResult[],
        };
      }

      console.log("Searching SearXNG for:", searchQuery);

      const results = await searchSearxng(searchQuery, {});

      console.log(
        "SearXNG returned results:",
        results.length
      );

      return {
        query: searchQuery,
        docs: results
          .map((r) => ({
            ...r,
            content: r.content || r.title || "",
          }))
          .filter((r) => r.content)
          .slice(0, 8),
      };
    }),
  ]);
}

const retrieverChain = createBasicWebSearchRetrieverChain();

const answeringChain = RunnableSequence.from([
  RunnableMap.from({
    query: (
      input: {
        query: string;
        chat_history: BaseMessage[];
      }
    ) => input.query,

    chat_history: (
      input: {
        query: string;
        chat_history: BaseMessage[];
      }
    ) => input.chat_history,

    context: RunnableSequence.from([
      (
        input: {
          query: string;
          chat_history: BaseMessage[];
        }
      ) => ({
        query: input.query,
        chat_history: formatChatHistoryAsString(
          input.chat_history
        ),
      }),

      retrieverChain,

      rerankDocs.withConfig({
        runName: "FinalSourceRetriever",
      }),

      processDocs,
    ]),
  }),

  webResponsePrompt,

  getLLM(0.3),

  new StringOutputParser(),
]).withConfig({
  runName: "FinalResponseGenerator",
});

export function webSearchAgent(
  query: string,
  history: BaseMessage[],
  emitter: EventEmitter
): EventEmitter {
  (async () => {
    try {
      console.log("=================================");
      console.log("WEB AGENT STARTED");
      console.log("Query:", query);
      console.log("History length:", history.length);
      console.log("=================================");

      const stream = answeringChain.streamEvents(
        {
          query,
          chat_history: history,
        },
        {
          version: "v2",
        }
      );

      console.log("Stream created successfully.");

      await handleStream(stream, emitter);

      console.log("WEB AGENT STREAM FINISHED");
    } catch (err) {
      console.error("=================================");
      console.error("WEB SEARCH AGENT ERROR:");
      console.error(err);
      console.error("=================================");

      emitter.emit("error", err);
    }
  })();

  return emitter;
}