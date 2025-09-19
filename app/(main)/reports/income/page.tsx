import IncomeReport, { IncomeReportRow } from "@/components/reports/income";

export default function ReportPage() {
  const rows: IncomeReportRow[] = [
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

  return (
    <div className="mx-auto my-8 w-full max-w-6xl">
    <IncomeReport    
      orgName="International Organization for Migration (IOM)"
      orgSub="IOM Migration Health Assessment Center"
      orgAddress="768/44, Thirbam Sadak, Baluwatar-4"
      orgPhone="+977 1 5970001"
      dateRange="05-Sep-2025 To 05-Sep-2025"
      reportDate="Friday, September 5, 2025"
      wbsCountry="MH.0087.NP10.04.01.001"
      rows={rows}
      totalUsd="$135.00"
      totalNpr="18,915.00"
      cashierName="Ansu PAL"
      exchangeRate="141.21"
    />
    </div>
  );
}
