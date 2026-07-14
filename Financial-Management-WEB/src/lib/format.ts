export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
