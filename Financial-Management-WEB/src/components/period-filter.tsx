"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  computePreset,
  firstDayOfMonthInput,
  lastDayOfMonthInput,
  PeriodPreset,
  toDateTimeLocalValue,
  toMonthInputValue,
} from "@/lib/period";

interface PeriodFilterProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
  initialPreset?: PeriodPreset;
}

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
  { key: "custom", label: "Personalizado (com horário)" },
  { key: "monthRange", label: "Intervalo de Meses" },
];

export function PeriodFilter({ from, to, onChange, initialPreset = "month" }: PeriodFilterProps) {
  const [activePreset, setActivePreset] = useState<PeriodPreset>(initialPreset);

  function selectPreset(preset: PeriodPreset) {
    setActivePreset(preset);
    if (preset === "custom" || preset === "monthRange") return;

    const range = computePreset(preset);
    onChange(range.from, range.to);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            type="button"
            size="sm"
            variant={activePreset === p.key ? "default" : "outline"}
            onClick={() => selectPreset(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {activePreset === "custom" && (
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="period-from">De</Label>
            <Input
              id="period-from"
              type="datetime-local"
              value={toDateTimeLocalValue(from)}
              onChange={(e) => e.target.value && onChange(new Date(e.target.value), to)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="period-to">Até</Label>
            <Input
              id="period-to"
              type="datetime-local"
              value={toDateTimeLocalValue(to)}
              onChange={(e) => e.target.value && onChange(from, new Date(e.target.value))}
            />
          </div>
        </div>
      )}

      {activePreset === "monthRange" && (
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="period-month-from">Mês inicial</Label>
            <Input
              id="period-month-from"
              type="month"
              value={toMonthInputValue(from)}
              onChange={(e) => e.target.value && onChange(firstDayOfMonthInput(e.target.value), to)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="period-month-to">Mês final</Label>
            <Input
              id="period-month-to"
              type="month"
              value={toMonthInputValue(to)}
              onChange={(e) => e.target.value && onChange(from, lastDayOfMonthInput(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
