import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import ThemeSwitch from "./ThemeSwitch";

export default function App() {
  // cursor spotlight effect (chips / source cards par mouse ke saath glow)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>(".src,.chip,.newbtn");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      {/* dark/light switch ka hidden checkbox: ise hamesha sabse upar rakho */}
      <input
        type="checkbox"
        id="theme-toggle"
        className="theme-input"
        aria-label="Toggle light mode"
      />

      {/* scroll progress bar */}
      <div className="progress" />

      {/* top-right theme switch */}
      <div className="theme-float">
        <ThemeSwitch />
      </div>

      <div className="h-full bg-bg text-text-primary">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </>
  );
}
