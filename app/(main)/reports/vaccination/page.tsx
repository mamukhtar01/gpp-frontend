"use client";

import VaccinationReport, {
  VaccinationReportRow,
} from "@/components/reports/VaccinationReport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import React, { useState, useEffect } from "react";

// Demo locations, you can replace or fetch dynamically as needed
const LOCATIONS = [
  { label: "MHAC Kathmandu", value: "Lazimpat Sadak, Panipokhari, Ward-3" },
  { label: "MHAC Pokhara", value: "Pokhara, Ward-5" },
  { label: "MHAC Biratnagar", value: "Biratnagar, Ward-10" },
];

export default function VaccinationReportPage() {
  // make the date inputs default to today
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(LOCATIONS[0].value);
  const [rows, setRows] = useState<VaccinationReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch data when dates change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/payments/vaccinations?fromDate=${fromDate}&toDate=${toDate}`
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch data.");
        }
        const data = await res.json();
        setRows(data);
      } catch (err: unknown) {
        setError((err as Error).message || "Unknown error");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fromDate, toDate]);

  // Format date range for display
  const dateRange =
    fromDate && toDate
      ? `${new Date(fromDate).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} To ${new Date(toDate).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
      : "";

  // For the address, use location value
  const orgAddress = location;
  const reportDate =
    fromDate === toDate
      ? new Date(fromDate).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  // Calculate totals from rows
  const totalUsd = rows
    .reduce((sum, row) => sum + parseFloat(row.totalAmount.replace("$", "")), 0)
    .toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: "currency",
      currency: "USD",
    });
  const totalNpr = rows
    .reduce((sum, row) => sum + parseFloat(row.nprAmount.replace(/,/g, "")), 0)
    .toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mx-auto my-8 w-full max-w-6xl">
      {/* Filter controls */}
      <form
        className="flex flex-wrap items-end gap-4 p-4 mb-8 bg-white shadow rounded"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={toDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            className="border rounded px-2 py-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Report */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>No Data found for Selected Date Range.</AlertTitle>
          <AlertDescription>
            <p>Please try adjusting your date range or filters.</p>
          </AlertDescription>
        </Alert>
      ) : (
        <VaccinationReport
          orgName="IOM Migration Health Assessment Center"
          orgSub="UN MIGRATION"
          orgAddress={orgAddress}
          orgPhone="+977 1 5970001"
          dateRange={dateRange}
          reportDate={reportDate}
          rows={rows}
          totalUsd={totalUsd}
          totalNpr={totalNpr}
        />
      )}
    </div>
  );
}
