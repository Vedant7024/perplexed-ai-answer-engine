import { useEffect, useState } from "react";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDomain } from "../../lib/utils";
import type { ImageResult } from "../../types";

interface Props {
  results: ImageResult[];
}

export default function ImageResultsGrid({ results }: Props) {
  const [active, setActive] = useState<number | null>(null); // kaun si image khuli hai
  const [broken, setBroken] = useState<Set<number>>(new Set()); // jo images load nahi hui

  // jo images kharab hain unhe chhupa do
  const visible = results
    .map((img, i) => ({ img, i }))
    .filter((x) => !broken.has(x.i));

  const pos = active === null ? -1 : visible.findIndex((x) => x.i === active);
  const current = pos >= 0 ? visible[pos].img : null;

  function markBroken(i: number) {
    setBroken((prev) => new Set(prev).add(i));
  }

  function go(step: number) {
    if (pos < 0 || visible.length === 0) return;
    setActive(visible[(pos + step + visible.length) % visible.length].i);
  }

  // Esc = band, Left/Right arrow = pichli ya agli image, aur peeche ka page scroll na ho
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pos, visible.length]);

  if (results.length === 0 || visible.length === 0) {
    return <p className="text-sm text-text-tertiary">No images found for this query.</p>;
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
        {visible.map(({ img, i }) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className="block w-full rounded-xl overflow-hidden border border-border bg-surface hover:border-accent transition-colors break-inside-avoid"
          >
            <img
              src={img.img_src}
              alt={img.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => markBroken(i)}
              className="w-full h-auto block"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
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
                key="viewer"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-auto relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                style={{ width: "min(95vw, 1100px)", maxHeight: "95dvh" }}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                  <p className="text-sm text-text-primary truncate">{current.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-text-tertiary mr-1">
                      {pos + 1} / {visible.length}
                    </span>
                    <button
                      onClick={() => setActive(null)}
                      className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                      aria-label="Close image"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center bg-black/40 p-2 min-h-0">
                  <img
                    src={current.img_src}
                    alt={current.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full object-contain"
                    style={{ maxHeight: "calc(100dvh - 190px)" }}
                  />

                  {visible.length > 1 && (
                    <>
                      <button
                        onClick={() => go(-1)}
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        onClick={() => go(1)}
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border">
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent-light hover:text-text-primary transition-colors"
                  >
                    <ExternalLink size={13} />
                    {getDomain(current.url)}
                  </a>
                  <a
                    href={current.img_src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    Open full image
                  </a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}