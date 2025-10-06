"use client";

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

export const columns: ColumnDef<TPayment>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const st = Number(row.getValue("status"));
      return (
        <div className="capitalize">
          {st === 1 ? (
            <Badge className="text-yellow-600 bg-yellow-100 border-yellow-600/30" variant={"outline"}>
              Payment Registered
            </Badge>
          ) : st === 2 ? (
            <Badge className="text-green-600 bg-green-100 border-green-600/30" variant={"outline"}>
              Payment Successful
            </Badge>
          ) : (
            <Badge className="text-red-600 bg-red-100 border-red-600/30" variant={"destructive"}>
              Payment Failed
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "case_number",
    header: "Case Number",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("case_number")}</div>
    ),
  },
  {
    id: "payerInfo",
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
    cell: ({ row }) => (
      <div className="lowercase text-center">{row.getValue("payerInfo")}</div>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(
        (row.getValue("paidAmount") as unknown as string) || "0"
      );
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "NPR",
      }).format(isFinite(amount) ? amount : 0);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
    {
    accessorKey: "type_of_payment",
    header: () => <div className="text-right">Type</div>,
    cell: ({ row }) => {
      const paymentType = row.getValue("type_of_payment");
      return <div className="font-mono text-xs">{paymentType === 2 ? "QRCode" : paymentType === 3 ? "Cash" : "Unknown"}</div>;
    },
  },
  {
    id: "date_of_payment",
    accessorKey: "date_of_payment",
    header: () => <div className="text-center">Date of Payment</div>,
    cell: ({ row }) => {
      const date = (row.getValue("date_of_payment") as unknown as string) || "";
      const formatted = date
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(date))
        : "—";
      return <div className="text-right text-sm">{formatted}</div>;
    },
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.case_number)}
            >
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