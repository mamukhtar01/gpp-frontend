import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type TCountryKey = 12 | 13 | 14 | 15 | 16 | 29;

export const COUNTRY_OPTIONS: { key: TCountryKey; label: string }[] = [
  { key: 12, label: "Canada" },
  { key: 13, label: "United States" },
  { key: 14, label: "Australia" },
  { key: 15, label: "New Zealand" },
  { key: 16, label: "United Kingdom" },
  { key: 29, label: "Japan" },
];

interface CountryOfDestinationProps {
  value: TCountryKey;
  onChange: (key: TCountryKey) => void;
  className?: string;
  label?: string;
}

export function CountryOfDestination({
  value,
  onChange,
  className = "",
  label = "Destination Country:",
}: CountryOfDestinationProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}
    >
      <label className="font-light text-base">{label}</label>
      <Select
        value={String(value)}
        onValueChange={(val) => onChange(Number(val) as TCountryKey)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select country..." />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-gray-50">
          {COUNTRY_OPTIONS.map((opt) => (
            <SelectItem key={opt.key} value={String(opt.key)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
