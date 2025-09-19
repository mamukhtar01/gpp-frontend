"use client";

import VaccinationReport, {
  VaccinationReportRow,
} from "@/components/reports/VaccinationReport";
import React, { useState } from "react";

// Demo locations, you can replace or fetch dynamically as needed
const LOCATIONS = [
  { label: "MHAC Kathmandu", value: "Lazimpat Sadak, Panipokhari, Ward-3" },
  { label: "MHAC Pokhara", value: "Pokhara, Ward-5" },
  { label: "MHAC Biratnagar", value: "Biratnagar, Ward-10" },
];

// Example initial data, replace with fetch/filter logic as needed
const initialRows: VaccinationReportRow[] = [
  {
    vaccination: "Varicella",
    unit: 17,
    rate: "$35.00",
    totalAmount: "$595.00",
    nprAmount: "84,019.95",
  },
  {
    vaccination: "Td",
    unit: 13,
    rate: "$2.00",
    totalAmount: "$26.00",
    nprAmount: "3,671.46",
  },
  {
    vaccination: "Pentavalent",
    unit: 1,
    rate: "$8.00",
    totalAmount: "$8.00",
    nprAmount: "1,129.68",
  },
  {
    vaccination: "MMR",
    unit: 15,
    rate: "$9.00",
    totalAmount: "$135.00",
    nprAmount: "19,063.35",
  },
  {
    vaccination: "Hepatitis B",
    unit: 12,
    rate: "$4.00",
    totalAmount: "$48.00",
    nprAmount: "6,778.08",
  },
];

export default function VaccinationReportPage() {
  const [fromDate, setFromDate] = useState("2025-09-05");
  const [toDate, setToDate] = useState("2025-09-05");
  const [location, setLocation] = useState(LOCATIONS[0].value);

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

  // You may filter or fetch rows based on date/location if your data allows
  const rows = initialRows;

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
      <VaccinationReport
        orgName="IOM Migration Health Assessment Center"
        orgSub="UN MIGRATION"
        orgAddress={orgAddress}
        orgPhone="+977 1 5970001"
        dateRange={dateRange}
        reportDate={reportDate}
        rows={rows}
        totalUsd="$812.00"
        totalNpr="114,662.52"
      />
    </div>
  );
}
