import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export type CountryKey = "US" | "UK" | "JAPAN" | "AUSTRALIA" | "NEWZEALAND" | "CANADA";

export const COUNTRY_OPTIONS: { key: CountryKey; label: string }[] = [
  { key: "US", label: "United States" },
  { key: "UK", label: "United Kingdom" },
  { key: "JAPAN", label: "Japan" },
  { key: "AUSTRALIA", label: "Australia" },
  { key: "NEWZEALAND", label: "New Zealand" },
  { key: "CANADA", label: "Canada" },
];

interface CountryOfDestinationProps {
  value: CountryKey;
  onChange: (key: CountryKey) => void;
  className?: string;
  label?: string;
}

export function CountryOfDestination({ value, onChange, className = "", label = "Country/Case Type:" }: CountryOfDestinationProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}>
      <label className="font-semibold text-base">{label}</label>
      <Select value={value} onValueChange={(val) => onChange(val as CountryKey)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select country..." />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_OPTIONS.map(opt => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}