"use client";
import * as React from "react";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { TPayment } from "@/lib/schema";
import { paymentColumns } from "./columns";

function getPaymentNavigation(payment: TPayment) {
  if (payment.status === 1 && payment.type_of_payment === 2) {
    return `/payments/qrcode/${payment.case_number}?paymentId=${payment.id}&case_type=${payment.case_management_system}`;
  } else if (payment.status === 2 && payment.type_of_payment === 2) {
    return `/payments/qrcode/${payment.case_number}/verify?paymentId=${payment.id}&case_type=${payment.case_management_system}`;
  } else if (payment.type_of_payment === 3) {
    return `/payments/cash/${payment.case_number}?paymentId=${payment.id}&case_type=${payment.case_management_system}`;
  }
  return null;
}

export function DataTable({ data }: { data: TPayment[] }) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: paymentColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full px-2 md:px-4 py-2 md:py-4 max-w-6xl mx-auto">
      {/* Filter/Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 py-4">
        <Input
          placeholder="Filter payments by case..."
          value={(table.getColumn("case_number")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("case_number")?.setFilterValue(event.target.value)
          }
          className="w-full md:w-80"
        />
        <div className="text-xs text-gray-500 ml-auto">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-lg overflow-visible">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gradient-to-r from-gray-50 to-gray-100 h-14">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-2 py-2 text-base font-semibold text-gray-900 tracking-wide break-words"
                    style={{ width: "auto", maxWidth: 200 }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const nav = getPaymentNavigation(row.original);
                return (
                  <TableRow
                    key={row.id}
                    className="hover:bg-blue-50 transition-all h-14 cursor-pointer"
                    onClick={() => nav && router.push(nav)}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-2 py-2 text-sm align-middle break-words"
                        style={{ maxWidth: 200, wordBreak: "break-word", whiteSpace: "pre-line" }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={paymentColumns.length} className="h-24 text-center">
                  <span className="text-gray-400">No results found.</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-4 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-full"
        >
          Previous
        </Button>
         <span className="text-xs text-gray-500">
          Page {table.getState().pagination?.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-full"
        >
          Next
        </Button>
      </div>
    </div>
  );
}