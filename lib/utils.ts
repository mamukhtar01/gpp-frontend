
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TUKTB_Cases } from "./schema";
import { AdditionalServiceFromDB, FeeStructure, TNewPaymentRecord } from "@/app/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Map excel data to UKTB_Cases type with error handling
export function mapToUKTBCases(data: string[][]): TUKTB_Cases[] {
  const results: TUKTB_Cases[] = [];

  // validate data
  if (data.length === 0) throw new Error("Data Mapping: No data provided");
  if (!Array.isArray(data[0])) throw new Error("Data Mapping: Invalid data format");


  data.forEach((item, index) => {
    try {
      if (!Array.isArray(item)) {
        throw new Error(`Row ${index} is not an array`);
      }

      if (item.length < 11) {
        throw new Error(`Row ${index} has insufficient fields (expected 11, got ${item.length})`);
      }

      const [
        , // Skip the first column (serial number)
        id,
        visa_type,
        location,
        appointment_date,
        appointment_time,
        exam_date,
        First_Name,
        Last_Name,
        native_name,
        Sex,
        date_of_birth,
        passport,
        telephone,     
      ] = item;

      if (!id) throw new Error(`Missing id in row ${index}`);
     


  

      results.push({
        id,
        visa_type: visa_type?.trim(),
        native_name: native_name?.trim(),
        exam_date: exam_date?.trim(),
        passport: passport?.trim(),
        First_Name: First_Name?.trim(),
        Last_Name: Last_Name?.trim(),
        Sex: Sex === "M" ? "Male" : Sex === "F" ? "Female" : Sex,
        date_of_birth,
        telephone: telephone?.trim(),
        amount: "1",
        appointment_date,
        appointment_time,
        location,
        Country: 4,
        Currency: 5,
        date_created: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`❌ Error processing row ${index}:`, (err as Error).message);
      // Skip invalid row instead of crashing
    }
  });

  return results;
}



// string to age
export function CalculateAge(dateString: string): number | null {
  const birthDate = new Date(dateString);

  // Check for invalid date
  if (isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}




// get fee based on age and fee structure
export function getFeeByAge(
  feeStructures: FeeStructure[],
  ageYears: number
): number | null {
  const ageMonths = ageYears * 12;

  const fee = feeStructures.find(
    (f) =>
      (f.min_age_months === null || ageMonths >= f.min_age_months) &&
      (f.max_age_months === null || ageMonths <= f.max_age_months)
  );

  return fee ? parseFloat(fee.fee_amount_usd) : null;
}



/** Reusable QR code generation function */
export async function generateQRCodeNPR({
  nprAmount,
  caseNo,
  purpose,
  reference,
}: {
  nprAmount: number | string;
  caseNo: string | number;
  purpose?: string;
  reference?: string | null;
}) {
  const res = await fetch("/api/nepalpay/generateQR", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionCurrency: "524", // NPR
      transactionAmount: Number(nprAmount),
      billNumber: caseNo,
      referenceLabel: reference,
      storeLabel: "Store1",
      terminalLabel: "Terminal1",
      purposeOfTransaction: purpose || "Bill payment",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.qrString || !json?.data?.validationTraceId) {
    throw new Error("QR generation failed");
  }
  return {
    qrString: json.data.qrString,
    validationTraceId: json.data.validationTraceId,
    timestamp: json.data.timestamp,
  };
}


// Utility to format date to YYYY-MM-DD
export function formatReadableDate(dateString: string): string {
  // Handles ISO string like "2025-10-06T05:25:00"
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // fallback for invalid
  // Example output: "06-Oct-2025"
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


// Get Country id from country code
export function getCountryIdFromCode(countryCode: string): number | null {
  const countryMap: { [key: string]: number } = {
    CA: 12,
    US: 13,
    AU: 14,
    NZ: 15,
    UK: 16,
    JP: 29,
  };
  return countryMap[countryCode] || null;
}



// Create UKTB Payment Record

type QRFields = {
  qrString: string;
  validationTraceId: string;
  timestamp: string;
};

export function createUKTBPaymentRecord(
  selectedCase: TUKTB_Cases,
  clients: TUKTB_Cases[],
  getClientTotal: (client: TUKTB_Cases) => number,
  remarks: Record<string, string>,
  addedServices: Record<string, AdditionalServiceFromDB[]>,
  grandTotalUSD: number,
  grandTotalLocal: number | null,
  exchangeRate: number | null,
  qrFields: QRFields | null
): TNewPaymentRecord {
  return {
    case_number: selectedCase.id,
    case_management_system: 2,
    mimosa_case: null,
    reference: null,
    amount_in_dollar: grandTotalUSD.toFixed(2),
    amount_in_local_currency: grandTotalLocal ? grandTotalLocal.toFixed(2) : grandTotalUSD.toFixed(2),
    type_of_payment: 2,
    date_of_payment: new Date().toISOString(),
    transaction_id: `TXN-${Date.now()}`,
    status: 1,
    validationTraceId: qrFields?.validationTraceId ?? "",
    service_type: "medical_exam",
    exchange_rate: exchangeRate || null,
    destination_country: 13, // UK
    payerInfo: `${selectedCase.First_Name || ""} ${selectedCase.Last_Name || ""}`.trim(),
    qr_timestamp: qrFields?.timestamp ?? "",
    paidAmount: grandTotalLocal ? grandTotalLocal.toFixed(2) : grandTotalUSD.toFixed(2),
    qr_string: qrFields?.qrString ?? "",
    wave: null,
    clinic: null,
    clients: clients.map((client) => ({
      id: client.id,
      name: `${client.First_Name} ${client.Last_Name}`,
      age: client.date_of_birth
        ? new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()
        : 0,
      amount: getClientTotal(client).toFixed(2),
      remark: remarks[client.id] || "",
      services: [], // Fill if needed
      additional_services: (addedServices[client.id] || []).map((s) => ({
        id: s.id.toString(),
        fee_amount_usd: s.fee_amount_usd,
        service_code: s.service_type_code.service_code,
        service_name: s.service_type_code.service_name,
      })),
    })),
  };
}