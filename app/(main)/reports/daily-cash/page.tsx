"use client";
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// DatePicker removed in favor of native date input (use the existing Input component)
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
  reference?: string;
};


// Helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "NPR" }).format(val);
};

const defaultSampleData: Transaction[] = [
  { id: 1, date: "2025-09-16", description: "Cash sale - Sandwiches", type: "cash", amount: 120.5, currency: "NPR", cashier: "Amina" },
  { id: 2, date: "2025-09-16", description: "QR Payment", type: "qrcode", amount: 40.0, currency: "NPR", cashier: "Amina" },
  { id: 3, date: "2025-09-16", description: "Daily collection - online", type: "qrcode", amount: 85.75, currency: "NPR", cashier: "Mohamed" },
  { id: 4, date: "2025-09-15", description: "Cash sale - Drinks", type: "cash", amount: 60.0, currency: "NPR", cashier: "Amina" },
  { id: 5, date: "2025-09-15", description: "QR Payment - Mobile", type: "qrcode", amount: 150.0, currency: "NPR", cashier: "Mohamed" },
  { id: 6, date: "2025-09-14", description: "Cash sale - Snacks", type: "cash", amount: 90.0, currency: "NPR", cashier: "Amina" },
  { id: 7, date: "2025-09-14", description: "QR Payment - Food", type: "qrcode", amount: 200.0, currency: "NPR", cashier: "Mohamed" },
  { id: 8, date: "2025-09-13", description: "Cash sale - Stationery", type: "cash", amount: 30.0, currency: "NPR", cashier: "Amina" },
  { id: 9, date: "2025-09-13", description: "QR Payment - Books", type: "qrcode", amount: 75.0, currency: "NPR", cashier: "Mohamed" },
  { id: 10, date: "2025-09-12", description: "Cash sale - Miscellaneous", type: "cash", amount: 45.0, currency: "NPR", cashier: "Amina" },
  { id: 11, date: "2025-09-12", description: "QR Payment - Accessories", type: "qrcode", amount: 110.0, currency: "NPR", cashier: "Mohamed" },
];


// Next.js page components must not accept props. Use default values inside the component.
const DailyCashReportPage = () => {
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState<string | null>("all");
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const transactions = defaultSampleData;

  // derived
  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return transactions
      .filter((t) => {
        const matchesType = !filterType || filterType === "all" || t.type === filterType;
        if (!matchesType) return false;
        if (selectedDate && !t.date.startsWith(selectedDate)) return false; // compare by day
        if (!lower) return true;
        return (
          (t.description || "").toLowerCase().includes(lower) ||
          (t.cashier || "").toLowerCase().includes(lower) ||
          (t.reference || "").toLowerCase().includes(lower)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, q, filterType, selectedDate]);

  const totals = useMemo(() => {
    const totalCash = filtered.filter((t) => t.type === "cash").reduce((s, t) => s + t.amount, 0);
    const totalQR = filtered.filter((t) => t.type === "qrcode").reduce((s, t) => s + t.amount, 0);
    return { totalCash, totalQR, total: totalCash + totalQR };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV(rows: Transaction[]) {
    const header = ["id", "date", "description", "type", "amount", "currency", "cashier", "reference"];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [r.id, r.date, `"${(r.description || "").replace(/"/g, '""') }"`, r.type, r.amount, r.currency || "", r.cashier || "", r.reference || ""].join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-cash-report-${selectedDate || new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
            <CardTitle className="text-2xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
              <span>Daily Cash Report</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate ?? ""}
                onChange={(e) => {
                  setSelectedDate(e.target.value || undefined);
                  setPage(1);
                }}
                className="w-36 border-blue-200 focus:ring-2 focus:ring-blue-400"
              />
              <Select onValueChange={(v) => { setFilterType(v || null); setPage(1); }}>
                <SelectTrigger className="w-32 border-blue-200">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="cash">Cash Payment</SelectItem>
                  <SelectItem value="qrcode">QR Code Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search description, cashier, ref..." className="w-full md:w-72 border-blue-200 focus:ring-2 focus:ring-blue-400" />
            <Button onClick={() => exportCSV(filtered)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-white rounded-b-lg">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-row gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-6 py-4 min-w-[140px]">
                <span className="text-xs text-blue-700 font-medium uppercase tracking-wide mb-1">Total Cash Payment</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(totals.totalCash)}</span>
              </div>
              <div className="flex flex-col items-center bg-green-50 border border-green-100 rounded-lg px-6 py-4 min-w-[140px]">
                <span className="text-xs text-green-700 font-medium uppercase tracking-wide mb-1">Total QR Code Payment</span>
                <span className="text-2xl font-bold text-green-900">{formatCurrency(totals.totalQR)}</span>
              </div>
              <div className="flex flex-col items-center bg-gray-50 border border-gray-100 rounded-lg px-6 py-4 min-w-[140px]">
                <span className="text-xs text-gray-700 font-medium uppercase tracking-wide mb-1">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
          <div className="py-2">
            <div className="h-[1px] w-full bg-gray-200" />
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Time / Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cashier</TableHead>
                  <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No transactions found</TableCell>
                  </TableRow>
                ) : (
                  paged.map((t) => (
                    <TableRow key={t.id} className="hover:bg-blue-50/40 transition">
                      <TableCell className="text-sm text-gray-900">{t.date}</TableCell>
                      <TableCell className="text-sm text-gray-700">{t.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${t.type === "cash" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {t.type === "cash" ? "Cash Payment" : "QR Code Payment"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-gray-900">{formatCurrency(t.amount)}</TableCell>
                      <TableCell className="text-sm text-gray-700">{t.cashier}</TableCell>
                      <TableCell className="text-sm text-gray-700">{t.reference}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-4">
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

export default DailyCashReportPage;
