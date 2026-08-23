// The one place a rupee figure becomes text.
//
// Prices are stored as a whole number of rupees so that "under 5 crore" stays a
// range query the database can answer. Indian pricing is read in lakh and
// crore, not millions, so 64000000 has to arrive on the page as "₹6.4 Cr".
// Filter boundaries use this same function, so the scale in the UI and the
// figure on the card can never drift apart.

const CRORE = 10_000_000;
const LAKH = 100_000;

/** Trims trailing zeros: 6.40 -> "6.4", 5.00 -> "5", 1.35 -> "1.35". */
function trim(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function formatPriceInr(rupees: number): string {
  if (!Number.isFinite(rupees) || rupees < 0) {
    return "Price on request";
  }
  if (rupees >= CRORE) {
    return `₹${trim(rupees / CRORE)} Cr`;
  }
  if (rupees >= LAKH) {
    return `₹${trim(rupees / LAKH)} L`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}
