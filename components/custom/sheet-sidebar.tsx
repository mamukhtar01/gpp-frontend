"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Upload, FileText, ListChecks, RefreshCcw, CurrencyIcon } from "lucide-react";


const sidebarMenu = [
  { href: "/actions/upload/uktbcases", icon: Upload, label: "Upload UKTB Cases" },
  { href: "/main/reports/reconciliation", icon: ListChecks, label: "Reconciliations" },
  { href: "/main/reports", icon: FileText, label: "Reports" },
  { href: "/payments/pricing", icon: CurrencyIcon, label: "Pricing Plans" },
  { href: "/main/payments/status", icon: RefreshCcw, label: "Change Payment Status" },
];

export function SheetSidebarMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleNav = (href: string) => {
    setOpen(true);
    // Slight delay to allow the Sheet to close smoothly before navigation
    router.push(href);
    setTimeout(() => {
      setOpen(false);
    }, 200); // adjust delay (ms) as desired for animation
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Select an action</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {sidebarMenu.map(({ href, icon: Icon, label }) => (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-left hover:bg-accent hover:text-accent-foreground group"
            >
              <Icon className="w-5 h-5 text-primary group-hover:text-accent-foreground" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}