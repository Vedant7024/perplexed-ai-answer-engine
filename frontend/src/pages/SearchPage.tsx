import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import ChatThread from "../components/chat/ChatThread";
import SearchBar from "../components/search/SearchBar";
import { useChat } from "../hooks/useChat";
import type { FocusMode } from "../types";

interface LocationState {
  initialQuery?: string;
  focusMode?: FocusMode;
}

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { turns, submit, retry } = useChat();
  const [focusMode, setFocusMode] = useState<FocusMode>(
    (location.state as LocationState)?.focusMode ?? "webSearch"
  );

  const didInit = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const lastCount = useRef(0);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const state = location.state as LocationState | null;
    if (!state?.initialQuery) {
      // arrived directly at /search with nothing to search for
      navigate("/", { replace: true });
      return;
    }
    submit(state.initialQuery, state.focusMode ?? "webSearch");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // user neeche ke paas hai ya nahi, ye yaad rakhta hai
  useEffect(() => {
    const onScroll = () => {
      stick.current =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // naya sawal aaye ya jawab likha ja raha ho to neeche scroll kar do
  useEffect(() => {
    const isNewTurn = turns.length !== lastCount.current;
    lastCount.current = turns.length;
    if (isNewTurn || stick.current) {
      bottomRef.current?.scrollIntoView({
        behavior: isNewTurn ? "smooth" : "auto",
        block: "end",
      });
    }
  }, [turns]);

  const isBusy = turns.length > 0 && turns[turns.length - 1].status === "streaming";

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 pb-44">
        <ChatThread
          turns={turns}
          onSuggestionSelect={(s) => submit(s, focusMode)}
          onRetry={retry}
        />
        <div ref={bottomRef} />
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8 pb-5 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <SearchBar
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
            onSubmit={(q) => submit(q, focusMode)}
            placeholder="Ask a follow-up..."
            size="compact"
            disabled={isBusy}
          />
        </div>
      </div>
    </div>
  );
}