"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({ id, value, onChange, placeholder, disabled }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => centsToDisplay(Math.round(value * 100)));

  useEffect(() => {
    const currentCents = Math.round(parseDisplayToCents(display));
    const nextCents = Math.round(value * 100);
    if (currentCents !== nextCents) {
      setDisplay(centsToDisplay(nextCents));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function parseDisplayToCents(text: string): number {
    const digitsOnly = text.replace(/\D/g, "");
    return digitsOnly ? parseInt(digitsOnly, 10) : 0;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const cents = parseDisplayToCents(event.target.value);
    setDisplay(centsToDisplay(cents));
    onChange(cents / 100);
  }

  return (
    <Input
      id={id}
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
