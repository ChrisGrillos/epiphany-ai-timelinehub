import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScreenshotCarousel({ screenshots, appName }) {
  const [current, setCurrent] = useState(0);

  if (!screenshots || screenshots.length === 0) return null;

  const prev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + screenshots.length) % screenshots.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % screenshots.length); };

  return (
    <div className="relative aspect-video bg-slate-100 overflow-hidden group">
      <img
        src={screenshots[current]}
        alt={`${appName} screenshot ${current + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
      />
      {screenshots.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}