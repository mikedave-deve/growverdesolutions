import React from "react";

// The Growverde Solutions mark: a single boxed wordmark containing both
// lines — GROWVERDE (bold) and SOLUTIONS (small, tracked) — with a
// quiet ascending notch cut into the top-right corner as a nod to
// growth. This exact box is reused everywhere the brand appears
// (portal sidebar, public nav/footer, auth screens) so the mark stays
// identical across the whole product.
export function Logo({ variant = "full", tone = "dark", className = "" }) {
  const isLight = tone === "light";
  const frame = isLight ? "border-white/70" : "border-ink-900";
  const text = isLight ? "text-white" : "text-ink-900";
  const sub = isLight ? "text-forest-200" : "text-forest-600";
  const notch = isLight ? "border-gold-200" : "border-gold-500";

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center justify-center w-9 h-9 border-[1.5px] ${frame} rounded-[6px] relative ${className}`}>
        <span className={`font-display font-extrabold text-[13px] tracking-tight ${text}`}>GS</span>
        <span className={`absolute -top-[1.5px] -right-[1.5px] w-2 h-2 border-t-[1.5px] border-r-[1.5px] ${notch} rounded-tr-[4px]`} />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start border-[1.5px] ${frame} rounded-[6px] px-3.5 py-1.5 relative leading-none ${className}`}>
      <span className={`font-display font-extrabold tracking-tight text-[15px] ${text}`}>
        GROW<span className={isLight ? "text-forest-200" : "text-forest-600"}>VERDE</span>
      </span>
      <span className={`font-body font-semibold text-[9px] tracking-[0.22em] uppercase mt-0.5 ${sub}`}>
        Solutions
      </span>
      <span className={`absolute -top-[1.5px] -right-[1.5px] w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] ${notch} rounded-tr-[6px]`} />
    </div>
  );
}
