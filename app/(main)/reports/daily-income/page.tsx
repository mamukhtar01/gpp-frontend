"use client";

import React, { useEffect, useState } from "react";
import IncomeReport, { IncomeReportRow } from "@/components/reports/income";


const LOCATIONS = [
  { label: "MHAC Kathmandu", value: "MH.0087.NP10.04.01.001" },
  { label: "MHAC Pokhara", value: "MH.0087.NP10.04.01.002" },
  { label: "MHAC Biratnagar", value: "MH.0087.NP10.04.01.003" },
];


export default function ReportPage() {
  // State for filters
  const [fromDate, setFromDate] = useState(new Date(Date.now() -  24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(LOCATIONS[0].value);
  const [paymentData, setPaymentData] = useState<IncomeReportRow[]>([]);

  // Format date range for display
  const dateRange =
    fromDate && toDate
      ? `${new Date(fromDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })} To ${new Date(toDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`
      : "";




  useEffect(() => {
    // Fetch or filter payment data based on fromDate, toDate, and location
    const fetchPaymentData = async () => {
      // Example fetch call (replace with actual API endpoint)

      const response = await fetch(`/api/payments?fromDate=${fromDate}&toDate=${toDate}&location=${location}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched payment data:", data);
        setPaymentData(data);
      } else {
        console.error("Failed to fetch payment data");
      }
    };

    fetchPaymentData();
    
  }, [fromDate, location, toDate]);


  // Example: Could filter rows based on date/location if data set allows
  const rows = paymentData; // Replace with filtered/fetched rows as needed

  const totalUsd = rows.reduce((sum, row) => sum + parseFloat(row.amount_in_dollar || "0"), 0).toFixed(2);
  const totalNpr = rows.reduce((sum, row) => sum + parseFloat(row.amount_in_local_currency || "0"), 0).toFixed(2);

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
        totalUsd={totalUsd}
        totalNpr={totalNpr}
        cashierName="Ansu PAL"       
      />
    </div>
  );
}

