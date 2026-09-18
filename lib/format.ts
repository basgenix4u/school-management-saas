/**
 * Formatting helpers for Nigerian school administration.
 *
 * Money, dates and phone numbers appear on invoices, receipts and report cards
 * that parents read carefully, so they are formatted in one place rather than
 * per component.
 */

const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NAIRA_COMPACT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Full precision, for invoices, receipts and any figure a parent may dispute. */
export function formatNaira(value: unknown): string {
  const amount = Number(value ?? 0);
  return NAIRA.format(Number.isFinite(amount) ? amount : 0);
}

/** Rounded, for dashboard tiles where kobo would be noise. */
export function formatNairaCompact(value: unknown): string {
  const amount = Number(value ?? 0);
  return NAIRA_COMPACT.format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

/**
 * Normalises the many ways a Nigerian phone number gets typed into the
 * international form, so `08031234567`, `+234 803 123 4567` and
 * `234-803-123-4567` all store identically.
 *
 * Returns null when the input cannot be a Nigerian mobile number, letting the
 * caller decide whether to reject or keep the raw value.
 */
export function normaliseNigerianPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) return `+234${digits.slice(1)}`;
  if (digits.length === 13 && digits.startsWith("234")) return `+${digits}`;
  if (digits.length === 10) return `+234${digits}`;
  return null;
}

export function formatPhoneForDisplay(input: string | null | undefined): string {
  const normalised = normaliseNigerianPhone(input);
  if (!normalised) return input?.trim() || "—";
  const national = normalised.slice(4);
  return `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

/**
 * Nigerian academic sessions span two calendar years and are written
 * "2025/2026". Terms are First, Second and Third.
 */
export function formatSession(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}

export const TERMS = ["First Term", "Second Term", "Third Term"] as const;
export type Term = (typeof TERMS)[number];

/** Derives the current session from the Nigerian academic calendar (resumption in September). */
export function currentSession(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 8 ? formatSession(year) : formatSession(year - 1);
}
