import { ServiceReceiptReport } from "@/components/custom/ServiceReceiptReport";


export default function ServiceReceipt() {
  return (
    <div className=" w-full">
    <ServiceReceiptReport
      billNumber="20251010-0001"
      date="2025-10-10"
      caseNumber="35206448"
      size={1}
      paName="GHIMIRE, Pragya"
      address="Urlabari 9, Morang"
      services={[
        {
          name: "HA ≥ 15y (Permanent visa) - 501 - Medical Examination,5",
          unit: 1,
          unitPrice: 82.0,
          amount: 82.0,
        },
        {
          name: "Chest X-ray (additional service)",
          unit: 1,
          unitPrice: 25.0,
          amount: 25.0,
        },
      ]}
      totalAmount={107.0}
      totalAmountNPR={0.0}
      totalCashReceivedNPR={0.0}
      netCashReturnNPR={0.0}
      cashierName="Kapil YONZON"
      exchangeRate={141.712}
    />
    </div>
  );
}