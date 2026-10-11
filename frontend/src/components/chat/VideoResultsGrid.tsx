import { useEffect, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDomain, truncate } from "../../lib/utils";
import type { VideoResult } from "../../types";

interface Props {
  results: VideoResult[];
}

export default function VideoResultsGrid({ results }: Props) {
  const [active, setActive] = useState<VideoResult | null>(null);

  // Esc dabane se band ho, aur video khula ho to peeche ka page scroll na ho
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (results.length === 0) {
    return <p className="text-sm text-text-tertiary">No videos found for this query.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video, i) => (
          <button
            key={video.url + i}
            onClick={() => setActive(video)}
            className="group text-left rounded-xl overflow-hidden border border-border bg-surface hover:border-border-strong transition-colors"
          >
            <div className="relative aspect-video bg-surface-2 overflow-hidden">
              <img src={video.img_src} alt={video.title} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={18} className="text-black ml-0.5" fill="black" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-text-primary leading-snug line-clamp-2">
                {truncate(video.title, 70)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">{getDomain(video.url)}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <>
            {/* dhundhla background: click karne par band */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/85 backdrop-blur-sm"
              onClick={() => setActive(null)}
            />

            {/* flex se bichobich rakha hai, isliye animation se position nahi bigadti */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none">
              <motion.div
                key="player"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-auto rounded-2xl border border-border bg-surface overflow-hidden flex flex-col shadow-2xl"
                style={{ width: "min(95vw, 1100px, calc((100dvh - 130px) * 16 / 9))" }}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                  <p className="text-sm text-text-primary truncate">{active.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span className="hidden sm:inline">Open on YouTube</span>
                    </a>
                    <button
                      onClick={() => setActive(null)}
                      className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                      aria-label="Close video"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="aspect-video bg-black">
                  <iframe
                    src={active.iframe_src}
                    title={active.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}