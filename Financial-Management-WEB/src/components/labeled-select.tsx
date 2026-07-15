"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface LabeledSelectOption {
  value: string;
  label: string;
}

interface LabeledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: LabeledSelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function LabeledSelect({
  value,
  onValueChange,
  options,
  placeholder,
  id,
  className,
  disabled,
}: LabeledSelectProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Select value={value || undefined} onValueChange={(next) => onValueChange(next ?? "")} disabled={disabled}>
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <span
          data-slot="select-value"
          className={cn("flex flex-1 truncate text-left", !selectedLabel && "text-muted-foreground")}
        >
          {selectedLabel ?? placeholder ?? ""}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
