export const CURRENCY = "GHS";

export function formatCedis(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(value: string): string {
  return new Date(value).toLocaleDateString("en-GH", { day: "2-digit", month: "short" });
}
