import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, LogOutIcon } from "lucide-react";

export function ProfileActionsBar() {
  return (
    <div
      className="sticky top-0 z-10 bg-white flex justify-between items-center mb-10 px-4 py-4 rounded-lg shadow"
      style={{
        backgroundColor: "var(--color-brand-50)",
        borderBottom: "2px solid var(--color-brand-100)",
      }}
    >
      <Link href="/" passHref>
        <Button
          variant="ghost"
          className="gap-2 text-brand-500 hover:bg-brand-100 hover:text-brand-700 font-semibold"
          type="button"
          style={{
            color: "var(--color-brand-500)",
          }}
        >
          <HomeIcon className="w-5 h-5" />
          Home
        </Button>
      </Link>
      <form action="/logout" method="POST">
        <Button
          variant="ghost"
          className="gap-2 font-semibold"
          type="submit"
          style={{
            backgroundColor: "var(--color-brand-500)",
            color: "#fff",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            borderRadius: "0.375rem",
            boxShadow: "0 2px 8px 0 rgba(0,51,160,0.10)",
          }}
        >
          <LogOutIcon className="w-5 h-5" />
          Logout
        </Button>
      </form>
    </div>
  );
}