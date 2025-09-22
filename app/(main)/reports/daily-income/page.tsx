"use client";

import React, { useState } from "react";
import IncomeReport, { IncomeReportRow } from "@/components/reports/income";

const LOCATIONS = [
  { label: "MHAC Kathmandu", value: "MH.0087.NP10.04.01.001" },
  { label: "MHAC Pokhara", value: "MH.0087.NP10.04.01.002" },
  { label: "MHAC Biratnagar", value: "MH.0087.NP10.04.01.003" },
];

const initialRows: IncomeReportRow[] = [
  {
    type: "Aus. Service Fee",
    billNo: 258322,
    billDate: "05-Sep-2025",
    paFullName: "PANERU, Aanaya",
    amount: "$45.00",
    nprAmount: "6,305.00",
    gl: "407020",
  },
  {
    type: "Aus. Service Fee",
    billNo: 258323,
    billDate: "05-Sep-2025",
    paFullName: "KHATIWADA, Dipen",
    amount: "$90.00",
    nprAmount: "12,610.00",
    gl: "407020",
  },
];

export default function ReportPage() {
  // State for filters
  const [fromDate, setFromDate] = useState("2025-09-05");
  const [toDate, setToDate] = useState("2025-09-05");
  const [location, setLocation] = useState(LOCATIONS[0].value);

  // Format date range for display
  const dateRange =
    fromDate && toDate
      ? `${new Date(fromDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })} To ${new Date(toDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`
      : "";

  // Get location label for display
  //const locationLabel = LOCATIONS.find((loc) => loc.value === location)?.label || "";

  // Example: Could filter rows based on date/location if data set allows
  const rows = initialRows; // Replace with filtered/fetched rows as needed

  return (
    <div className="mx-auto my-8 w-full max-w-6xl">
      {/* Filter controls */}
      <form className="flex flex-wrap items-end gap-4 p-4 mb-8 bg-white shadow rounded" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            max={toDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            min={fromDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            className="border rounded px-2 py-1"
            value={location}
            onChange={e => setLocation(e.target.value)}
          >
            {LOCATIONS.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>
      </form>

      {/* Report */}
      <IncomeReport
        orgName="International Organization for Migration (IOM)"
        orgSub="IOM Migration Health Assessment Center"
        orgAddress="768/44, Thirbam Sadak, Baluwatar-4"
        orgPhone="+977 1 5970001"
        dateRange={dateRange}
        reportDate={
          fromDate === toDate
            ? new Date(fromDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""
        }
        wbsCountry={location}
        rows={rows}
        totalUsd="$135.00"
        totalNpr="18,915.00"
        cashierName="Ansu PAL"
        exchangeRate="141.21"
      />
    </div>
  );
}