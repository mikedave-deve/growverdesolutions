// e.g. "2:35 AM" — shared by anywhere the API pre-formats a clock-face
// time for the frontend (attendance sessions, activity log entries).
export function formatClockTime(date) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}
