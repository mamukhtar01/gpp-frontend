"use client";
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DownloadIcon } from "lucide-react";

// Types
type Transaction = {
  id: string | number;
  date: string; // ISO date
  description: string;
  type: "cash" | "qrcode";
  amount: number;
  currency?: string;
  cashier?: string;
};


// Helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(val);
};

const sampleData: Transaction[] = [
  { id: 1, date: "2025-09-16", description: "Cash Payment", type: "cash", amount: 250.0, currency: "USD", cashier: "Amina" },
  { id: 2, date: "2025-09-16", description: "QR Code Payment", type: "qrcode", amount: 300.0, currency: "USD", cashier: "Mohamed" },
];


// Next.js page components must not accept props. Use default values inside the component.
const EndOfDayReportPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const transactions = sampleData;
  const reportDate = undefined;

  // Only include QR code and Cash payments (income only)
  const filtered = useMemo(
    () =>
      transactions.filter(
        (t: Transaction) => t.type === "cash" || t.type === "qrcode"
      ),
    [transactions]
  );

  const totalIncome = useMemo(
    () => filtered.reduce((s: number, t: Transaction) => s + t.amount, 0),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV(rows: Transaction[]) {
    const header = ["id", "date", "description", "type", "amount", "currency", "cashier"];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [r.id, r.date, `"${(r.description || "").replace(/"/g, '""') }"`, r.type, r.amount, r.currency || "", r.cashier || ""].join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `end-of-day-report-${reportDate || new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 container mx-auto p-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">End of Day Report {reportDate ? `- ${reportDate}` : ""}</CardTitle>
          <Button onClick={() => exportCSV(filtered)}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg border bg-white">
              <div className="text-sm text-muted-foreground">Total Income</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalIncome)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800`}>
                          {t.type === "cash" ? "Cash" : "QR Code"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                      <TableCell>{t.cashier}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Showing {filtered.length} result(s)</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <div className="text-sm">{page} / {totalPages}</div>
              <Button variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndOfDayReportPage;
