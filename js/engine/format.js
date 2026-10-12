// Money is handled in whole CENTS inside the engine so answers never carry floating-point junk.

const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 1234 → "$12.34", 500 → "$5", 123400 → "$1,234". Shows cents only when there are some (or force). */
export function money(cents, { decimals } = {}) {
  const neg = cents < 0;
  const c = Math.abs(Math.round(cents));
  const d = Math.floor(c / 100), r = c % 100;
  const show = decimals ?? r !== 0;
  return (neg ? '-' : '') + '$' + commas(d) + (show ? '.' + String(r).padStart(2, '0') : '');
}

/** Whole numbers with commas: 5000 → "5,000". */
export const num = (n) => commas(Math.round(n));

/** Cents → dollars number for answers (exactly representable to 2 decimals). */
export const dollars = (cents) => Math.round(cents) / 100;

/** Round a dollar value to cents. */
export const toCents = (d) => Math.round(Number(d) * 100);
