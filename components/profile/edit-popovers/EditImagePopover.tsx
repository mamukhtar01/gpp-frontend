"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TUser } from "@/lib/schema";

export function EditImagePopover({
  user,
  setOpenField,
}: {
  user: TUser;
  setOpenField: (v: null) => void;
}) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(
    user.avatar ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${user.avatar}` : undefined
  );
  const [saving, setSaving] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
          user.avatar = avatar ? "new-fake-avatar-id" : user.avatar;
          setSaving(false);
          setOpenField(null);
        }, 1000);
      }}
      className="space-y-3"
    >
      <Label htmlFor="profile-image" className="font-semibold">
        Change Image
      </Label>
      <div className="flex items-center gap-2">
        <Avatar className="h-12 w-12 border-2 border-brand-300">
          <AvatarImage src={preview} alt="Preview" />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <input
          id="profile-image"
          type="file"
          accept="image/*"
          className="block w-full text-sm file:bg-brand-500 file:text-white file:rounded file:px-2 file:py-1"
          onChange={handleImageChange}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setOpenField(null)}
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