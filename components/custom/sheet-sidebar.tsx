import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Menu, Upload, FileText, ListChecks, RefreshCcw } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetSidebarMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Select an action</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-2 mt-6">
          <Link href="/main/payments/qrcode" className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-left hover:bg-accent hover:text-accent-foreground group">
            <Upload className="w-5 h-5 text-primary group-hover:text-accent-foreground" />
            <span>Upload UKTB Cases</span>
          </Link>
          <Link href="/main/reports/reconciliation" className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-left hover:bg-accent hover:text-accent-foreground group">
            <ListChecks className="w-5 h-5 text-primary group-hover:text-accent-foreground" />
            <span>Reconciliations</span>
          </Link>
          <Link href="/main/reports" className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-left hover:bg-accent hover:text-accent-foreground group">
            <FileText className="w-5 h-5 text-primary group-hover:text-accent-foreground" />
            <span>Reports</span>
          </Link>
          <Link href="/main/payments/status" className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-left hover:bg-accent hover:text-accent-foreground group">
            <RefreshCcw className="w-5 h-5 text-primary group-hover:text-accent-foreground" />
            <span>Change Payment Status</span>
          </Link>
        </nav>

        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
