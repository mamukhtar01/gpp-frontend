"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { TPayment } from "@/lib/schema";

export function DataTable({
  data,
  columns,
}: {
  data: TPayment[];
  columns: ColumnDef<TPayment>[];
}) {
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Filter/Search */}
      <div className="flex items-center py-6 gap-8">
        <Input
          placeholder="Filter payments by case..."
          value={
            (table.getColumn("case_number")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("case_number")?.setFilterValue(event.target.value)
          }
          className="w-96"
        />
        <div className="text-sm text-gray-500 ml-auto">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border bg-white shadow">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-16">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-4 text-base font-semibold text-gray-800 tracking-wide"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-100 transition-all h-14 hover:cursor-pointer"
                  // Navigate to payment details page on row click
                  onClick={() => {
                    // nepal qrcode payment and status is registered, go to payment page
                    if (
                      row.original.status === 1 &&
                      row.original.type_of_payment === 2
                    ) {
                      router.push(
                        `/payments/qrcode/${row.original.case_number}?case_type=${row.original.case_management_system}`
                      );
                    } else if (
                      row.original.status === 2 &&
                      row.original.type_of_payment === 2
                    ) {
                      router.push(
                        `/payments/qrcode/${row.original.case_number}/verify?case_type=${row.original.case_management_system}`
                      );
                    }
                    // cash payment, go to cash payment details page
                    else if (row.original.type_of_payment === 3) {
                      router.push(
                        `/payments/cash/${row.original.case_number}?case_type=${row.original.case_management_system}`
                      );
                    }
                  }}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-4 text-sm align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-4 py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
