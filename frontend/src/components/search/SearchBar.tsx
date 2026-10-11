import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import FocusModeSelector from "./FocusModeSelector";
import type { FocusMode } from "../../types";

interface Props {
  focusMode: FocusMode;
  onFocusModeChange: (mode: FocusMode) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  size?: "large" | "compact";
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  focusMode,
  onFocusModeChange,
  onSubmit,
  placeholder = "Ask anything...",
  size = "large",
  disabled = false,
  autoFocus = false,
}: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isLarge = size === "large";

  return (
    <div className={`box w-full ${isLarge ? "" : "box-compact"}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
      />

      <div className="bar">
        <div className="flex items-center gap-2">
          <FocusModeSelector value={focusMode} onChange={onFocusModeChange} compact={!isLarge} />
          {isLarge && (
            <button
              type="button"
              disabled
              title="Attach a file (not implemented)"
              className="pill"
            >
              <Paperclip size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Submit search"
          className="send"
        >
          <ArrowUp size={isLarge ? 18 : 15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}