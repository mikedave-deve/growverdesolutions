export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(isoOrDate, opts = { month: "short", day: "numeric", year: "numeric" }) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

export function formatTime(isoOrDate) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
}

// Masks all but the last `visible` characters. Never pass raw sensitive
// values into this from real data — the backend should return
// pre-masked fields (e.g. "•••• 4821") and this is only for local
// mock/demo formatting.
export function maskAccountNumber(value, visible = 4) {
  const str = String(value);
  const tail = str.slice(-visible);
  return `•••• ${tail}`;
}

export function maskSSN() {
  return "•••-••-••••";
}
