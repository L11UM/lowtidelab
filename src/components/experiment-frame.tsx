"use client";

import { useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

// Renders AI/human-authored experiment HTML inside a sandboxed iframe.
// Security note: sandbox intentionally omits "allow-same-origin", so the iframe gets
// an opaque origin — it cannot read this site's cookies/localStorage/DOM, cannot
// navigate the top-level page, and cannot open popups. This is the primary safety
// boundary for untrusted/AI-generated demo code, not the HTML sanitizer alone.
export function ExperimentFrame({ html, title }: { html: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="glass relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
    >
      <iframe
        title={title}
        srcDoc={html}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        loading="lazy"
        className="h-full w-full border-0 bg-background"
      />
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
