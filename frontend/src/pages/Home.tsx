import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../components/search/SearchBar";
import type { FocusMode } from "../types";

// Clickable example questions shown under the search box.
// "i" is the little icon shown at the start of each chip.
const EXAMPLE_PROMPTS = [
  { i: "🧠", text: "Explain quantum entanglement simply" },
  { i: "⚡", text: "Latest breakthroughs in fusion energy" },
  { i: "💻", text: "Compare React Server Components vs SSR" },
  { i: "🌍", text: "What is happening in India today?" },
];

export default function Home() {
  const [focusMode, setFocusMode] = useState<FocusMode>("webSearch");
  const navigate = useNavigate();

  // Going to /search replaces this whole page, so this intro text
  // disappears as soon as a search starts and results appear.
  function handleSubmit(query: string) {
    navigate(
      `/search?q=${encodeURIComponent(query)}&focus=${focusMode}`,
      { state: { initialQuery: query, focusMode } }
    );
  }

  return (
    <div className="home-page min-h-full flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src="/perplexed-logo.png"
            alt="Perplexed"
            className="w-11 h-11 object-contain mb-4"
          />
          <h1
            className="text-3xl md:text-4xl text-text-primary text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Hello Shriyaa let's get started with Perplexed!
          </h1>
          <p className="mt-3 text-sm md:text-base text-text-tertiary text-center">
            Ask anything. Get answers with sources, not just links.
          </p>
        </div>

        <SearchBar
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          onSubmit={handleSubmit}
          size="large"
          autoFocus
        />

        <div className="chips">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p.text}
              type="button"
              data-i={p.i}
              className="chip"
              onClick={() => handleSubmit(p.text)}
            >
              {p.text}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}