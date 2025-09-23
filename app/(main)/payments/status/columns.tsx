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
            <Badge className="text-yellow-500" variant={"outline"}>
              Pending
            </Badge>
          ) : st === 2 ? (
            <Badge className="text-green-500" variant={"outline"}>
              Success
            </Badge>
          ) : (
            <Badge className="text-red-500" variant={"destructive"}>
              Failed
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-3 py-2 text-sm   font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-200"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client
          <ArrowUpDown />
        </Button>
      );
    },
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
        currency: "USD",
      }).format(isFinite(amount) ? amount : 0);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "date_of_payment",
    accessorKey: "date_of_payment",
    header: () => <div className="text-center">Date of Payment</div>,
    cell: ({ row }) => {
      const date =
        (row.getValue("date_of_payment") as unknown as string) || "0";

      // display the full date

      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));

      return <div className="text-right text-xs">{formatted}</div>;

      return <div className="text-right font-medium">{formatted}</div>;
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
          <DropdownMenuContent
            align="end"
            className="bg-gray-100 text-gray-900"
          >
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
