"use client";

import { useState, useRef } from "react";
import { PencilIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TUser } from "@/app/types";
import { EditPhonePopover } from "./edit-popovers/EditPhonePopover";

export function InfoRow({
  label,
  value,
  icon,
  editableField,
  user,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  editableField?: "phone";
  user?: TUser;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null!);

  // Only phone is editable here, but this pattern allows others if needed
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-brand-600)" }}>
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold flex items-center gap-2">
        {value}
        {editableField === "phone" && user && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="p-1 text-brand-500 hover:text-brand-700 rounded transition"
                style={{ color: "var(--color-brand-500)" }}
                type="button"
                aria-label="Edit phone"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60" sideOffset={4}>
              <EditPhonePopover user={user} setOpenField={() => setOpen(false)} inputRef={inputRef} />
            </PopoverContent>
          </Popover>
        )}
      </span>
    </div>
  );
}