import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { TPayment } from "@/lib/schema";

function formatStatus(status: number) {
  switch (status) {
    case 1:
      return (
        <Badge className="text-yellow-600 bg-yellow-100 border-yellow-600/30" variant={"outline"}>
          Payment Registered
        </Badge>
      );
    case 2:
      return (
        <Badge className="text-green-600 bg-green-100 border-green-600/30" variant={"outline"}>
          Payment Successful
        </Badge>
      );
    default:
      return (
        <Badge className="text-red-600 bg-red-100 border-red-600/30" variant={"destructive"}>
          Payment Failed
        </Badge>
      );
  }
}

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
  }).format(isFinite(value) ? value : 0);
}

function formatDate(date: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const paymentColumns: ColumnDef<TPayment>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => formatStatus(Number(row.getValue("status"))),
  },
  {
    accessorKey: "case_number",
    header: "Case Number",
    cell: ({ row }) => <div className="capitalize">{row.getValue("case_number")}</div>,
  },
  {
    accessorKey: "payerInfo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-3 py-2 text-base font-semibold uppercase tracking-wide text-gray-800 hover:bg-gray-200"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Client
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase text-center">{row.getValue("payerInfo")}</div>,
  },
  {
    accessorKey: "paidAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => <div className="text-right font-medium">{formatAmount(row.getValue("paidAmount"))}</div>,
  },
  {
    accessorKey: "service_type",
    header: () => <div className="text-right">Service Type</div>,
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("service_type")}</div>,
  },
  {
    accessorKey: "type_of_payment",
    header: () => <div className="text-right">Payment Method</div>,
    cell: ({ row }) => {
      const paymentType = row.getValue("type_of_payment");
      return (
        <div className="font-mono text-xs">
          {paymentType === 2 ? "QRCode" : paymentType === 3 ? "Cash" : "Unknown"}
        </div>
      );
    },
  },
  {
    accessorKey: "date_of_payment",
    header: () => <div className="text-center">Date of Payment</div>,
    cell: ({ row }) => <div className="text-right text-sm">{formatDate(row.getValue("date_of_payment") as string)}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-50 text-gray-900 p-2">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.case_number)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Print Receipt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
