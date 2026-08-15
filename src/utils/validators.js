export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value) {
  return /^[\d()+\-.\s]{7,20}$/.test(value);
}

// Returns a 0–4 strength score. This is a UX affordance only — real
// password policy enforcement must also happen server-side.
export function passwordStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

export function passwordStrengthLabel(score) {
  return ["Very weak", "Weak", "Fair", "Good", "Strong"][score] ?? "Very weak";
}
