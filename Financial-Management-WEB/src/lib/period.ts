import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";

export type PeriodPreset = "today" | "week" | "month" | "year" | "custom" | "monthRange";

export function computePreset(preset: PeriodPreset, reference: Date = new Date()): { from: Date; to: Date } {
  switch (preset) {
    case "today":
      return { from: startOfDay(reference), to: endOfDay(reference) };
    case "week":
      return { from: startOfWeek(reference, { weekStartsOn: 1 }), to: endOfDay(reference) };
    case "year":
      return { from: startOfYear(reference), to: endOfYear(reference) };
    case "month":
    default:
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
  }
}

export function toApiDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function toDateTimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function toMonthInputValue(date: Date): string {
  return format(date, "yyyy-MM");
}

export function firstDayOfMonthInput(monthValue: string): Date {
  const [year, month] = monthValue.split("-").map(Number);
  return startOfMonth(new Date(year, month - 1, 1));
}

export function lastDayOfMonthInput(monthValue: string): Date {
  const [year, month] = monthValue.split("-").map(Number);
  return endOfMonth(new Date(year, month - 1, 1));
}
