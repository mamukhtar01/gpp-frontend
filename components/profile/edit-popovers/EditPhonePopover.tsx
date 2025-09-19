"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TUser } from "@/app/types";

export function EditPhonePopover({
 
  setOpenField,
  inputRef,
}: {
  user: TUser;
  setOpenField: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const [phone, setPhone] = useState('6775875858');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [inputRef]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
        
          setSaving(false);
          setOpenField();
        }, 800);
      }}
      className="space-y-3"
    >
      <Label htmlFor="phone-input" className="font-semibold">
        Edit Phone
      </Label>
      <Input
        ref={inputRef}
        id="phone-input"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={{
          borderColor: "var(--color-brand-300)",
          background: "var(--color-brand-50)",
        }}
        className="w-full"
      />
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setOpenField()}
          disabled={saving}
          style={{ color: "var(--color-brand-500)" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-500 text-white hover:bg-brand-700"
          style={{
            backgroundColor: "var(--color-brand-500)",
            color: "#fff",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}