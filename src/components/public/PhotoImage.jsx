import React from "react";
import { User } from "lucide-react";

// Real-photo counterpart to the old dashed-box placeholder — same "ph"
// box styling (background, border-radius, overflow clip) so it drops
// into the exact same layout slots. Pass `src` for a real photo, or
// omit it (e.g. a leadership hire whose photo the client will add
// later) to fall back to an icon + label placeholder.
export function PhotoImage({ src, alt = "", label, variant = "default", className = "", style }) {
  const cls = variant === "dark" ? "ph ph-dark" : variant === "gold" ? "ph ph-gold" : "ph";
  return (
    <div className={`${cls} ${className}`} style={style}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <>
          <User />
          {label && <span>{label}</span>}
        </>
      )}
    </div>
  );
}
