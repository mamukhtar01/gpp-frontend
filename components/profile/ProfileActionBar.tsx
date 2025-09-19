"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PencilIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditImagePopover } from "./edit-popovers/EditImagePopover";
import { TUser } from "@/app/types";

export function ProfileAvatarSection({ user }: { user: TUser }) {
    
  const [openField, setOpenField] = useState<null | "image" | "title">(null);

  return (
    <Card
      className="col-span-1 shadow-lg border-0"
      style={{
        background: "linear-gradient(180deg, var(--color-brand-50) 0%, #fff 100%)",
      }}
    >
      <CardHeader className="flex flex-col items-center text-center gap-2">
        <div className="relative">
          <Avatar className="h-28 w-28 shadow-lg border-4 border-white bg-brand-200">
            <AvatarImage
              src={
                user.avatar
                  ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${user.avatar}`
                  : undefined
              }
              alt={user.first_name ?? "User"}
            />
            <AvatarFallback
              className="text-3xl bg-brand-200 text-brand-700"
              style={{
                backgroundColor: "var(--color-brand-200)",
                color: "var(--color-brand-700)",
              }}
            >
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {/* Edit image popover */}
          <Popover open={openField === "image"} onOpenChange={open => setOpenField(open ? "image" : null)}>
            <PopoverTrigger asChild>
              <button
                className="absolute bottom-2 right-2 bg-brand-500 text-white rounded-full p-2 shadow hover:bg-brand-700 transition"
                style={{
                  backgroundColor: "var(--color-brand-500)",
                }}
                aria-label="Edit avatar"
                type="button"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60">
              <EditImagePopover user={user} setOpenField={setOpenField} />
            </PopoverContent>
          </Popover>
        </div>
        <CardTitle className="mt-4 text-2xl font-bold text-brand-700" style={{ color: "var(--color-brand-700)" }}>
          {user.first_name} {user.last_name}
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-xs"
            style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand-900)" }}
          >
            <span>{user.title ?? "User"}</span>
            {/* Edit title popover */}
            <Popover open={openField === "title"} onOpenChange={open => setOpenField(open ? "title" : null)}>
              <PopoverTrigger asChild>
                <button
                  className="ml-2 p-1 text-brand-500 hover:text-brand-700 rounded transition"
                  style={{ color: "var(--color-brand-500)" }}
                  type="button"
                  aria-label="Edit title"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60" sideOffset={4}>
              </PopoverContent>
            </Popover>
          </Badge>
        </div>
        <p className="text-sm mt-2" style={{ color: "var(--color-brand-400)" }}>
          {user.email}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-xs mt-4" style={{ color: "var(--color-brand-700)" }}>
        <span>
          Member since{" "}
          <span className="font-semibold">
            {user.last_access ? new Date(user.last_access).toLocaleDateString() : "—"}
          </span>
        </span>
        <span className="mt-1 text-[10px] text-brand-300">
          User ID: {user.id}
        </span>
      </CardContent>
    </Card>
  );
}