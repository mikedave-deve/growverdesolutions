import React from "react";

// Infinite CSS-driven scroller. Duplicates the item list once so the
// looping animation (defined in styles/public-site.css) is seamless.
export function Marquee({ items, renderItem, reverse = false }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-row">
      <div className={`marquee-track${reverse ? " reverse" : ""}`}>
        {doubled.map((item, i) => (
          <React.Fragment key={i}>{renderItem(item, i)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function LogoChip({ children }) {
  return <div className="logo-chip">{children}</div>;
}

export function Pill({ children }) {
  return (
    <span className="pill">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.6h7.6z" />
      </svg>
      {children}
    </span>
  );
}
