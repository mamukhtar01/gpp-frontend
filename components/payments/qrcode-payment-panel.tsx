"use client";

import { useState, useMemo } from "react";
import { Separator } from "@radix-ui/react-separator";
import { createPayment } from "@/app/server_actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, X, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TNewPaymentRecord } from "@/app/types";
import { CaseMember, CaseMemberSummarySearch } from "./search-mimosa-combobox";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import { CountryOfDestination, TCountryKey } from "./country-of-destination-select";
import { calculateAge, getAustraliaAgeBasedFee, getCanadaAgeBasedFee, getJapanAgeBasedFee, getNewZealandAgeBasedFee, getUKAgeBasedFee, getUSAgeBasedFee } from "@/lib/fee-utils";

export function QrCodePaymentPanel() {
  // Use the first country as default
  const [country, setCountry] = useState<TCountryKey>(13); // Default to US

  const [caseMembers, setCaseMembers] = useState<CaseMember[] | null>(null);
  const [reference, setReference] = useState<string>("");

  // Exchange rate state Context
  const exchangeRate = useExchangeRate();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Remove a member from the table
  const handleRemoveMember = (id: number) => {
    setCaseMembers((prev) =>
      prev ? prev.filter((m) => m.CaseMemberID !== id) : prev
    );
  };

  // Country-specific fee calculation
  function getCountrySpecificFee(age: number, specialType?: string) {
    if (country === 12) return getCanadaAgeBasedFee(age);
    if (country === 13) return getUSAgeBasedFee(age);
    if (country === 14) return getAustraliaAgeBasedFee(age, specialType);
    if (country === 15) return getNewZealandAgeBasedFee(age);
    if (country === 16) return getUKAgeBasedFee(age);
    if (country === 29) return getJapanAgeBasedFee(age);
    return 0;
  }

  // Total calculation (in USD)
  const grandTotalUSD = useMemo(() => {
    if (!caseMembers) return 0;
    return caseMembers.reduce((sum, member) => {
      const age = calculateAge(member.BirthDate);
      return sum + getCountrySpecificFee(age);
    }, 0);
  }, [caseMembers, country]);

  // Total calculation (in local currency)
  const grandTotalNPR = useMemo(() => {
    if (!exchangeRate) return null;
    return grandTotalUSD * exchangeRate;
  }, [grandTotalUSD, exchangeRate]);

  async function handleQRGenerateAndCreatePayment() {
    setLoading(true);
    try {
      if (!caseMembers || caseMembers.length === 0)
        throw new Error("No case members selected.");
      if (!exchangeRate) throw new Error("Exchange rate is not available.");

      // Use the CaseNo from the first member, adjust if needed
      const caseNo = caseMembers[0].CaseNo;

      const res = await fetch("/api/nepalpay/generateQR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: grandTotalNPR,
          billNumber: caseNo,
          referenceLabel: reference,
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(JSON.stringify(json));
      if (!json?.data?.qrString || !json?.data?.validationTraceId) {
        throw new Error("Invalid response from QR generation API");
      }

      const qrString = json.data?.qrString;
      const validationTraceId = json.data?.validationTraceId;
      const timestamp = json?.timestamp;

      // Compose payment record
      const paymentRecord: TNewPaymentRecord = {
        case_number: caseNo,
        mimosa_case: null, // cases table
        case_management_system: 1, // or adjust as needed
        reference: reference || null,
        amount_in_dollar: grandTotalUSD.toFixed(2),
        amount_in_local_currency: grandTotalNPR ? grandTotalNPR.toFixed(2) : "",
        type_of_payment: 2,
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 1,
        validationTraceId: validationTraceId ?? "",
        payerInfo: caseMembers.map((m) => m.FullName).join(", "),
        qr_timestamp: timestamp ?? "",
        paidAmount: grandTotalNPR ? grandTotalNPR.toFixed(2) : "",
        qr_string: qrString,
        wave: null,
        clinic: null,
        destination_country: country,
        exchange_rate: exchangeRate,
        clients: caseMembers.map((m) => ({
          id: m.CaseMemberID.toString(),
          name: m.FullName,
          age: calculateAge(m.BirthDate),
          amount: getCountrySpecificFee(calculateAge(m.BirthDate)).toFixed(2),
        })),
      };

      const paymentRes = await createPayment(paymentRecord);
      if (!paymentRes) throw new Error("Failed to create payment record");

      router.push(`/payments/qrcode/${caseNo}?paymentId=${paymentRes.id}`);
    } catch (e: unknown) {
      alert("Failed to generate QR: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  console.log("Rendering QrCodePaymentPanel with country:", country);

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-6xl min-h-[470px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <ExchangeRateWidget exchangeRate={exchangeRate} />
        <CountryOfDestination value={country} onChange={setCountry} />
      </div>

      <CaseMemberSummarySearch setSelectedSummary={setCaseMembers} />
      <Separator className="my-8" />

      {caseMembers && caseMembers.length > 0 && (
        <>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/60">
                <TableRow>
                  <TableHead className="w-[8%]">ID</TableHead>
                  <TableHead className="w-[18%]">Name</TableHead>
                  <TableHead className="w-[12%]">Relation</TableHead>
                  <TableHead className="w-[8%]">Gender</TableHead>
                  <TableHead className="w-[14%]">Birth Date</TableHead>
                  <TableHead className="w-[8%]">Age</TableHead>
                  <TableHead className="w-[14%] text-right">Amount (USD)</TableHead>
                  <TableHead className="w-[10%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseMembers.map((member) => {
                  const age = calculateAge(member.BirthDate);
                  const amount = getCountrySpecificFee(age);

                  return (
                    <TableRow key={member.CaseMemberID}>
                      <TableCell className="font-mono text-[11px]">
                        {member.CaseMemberID}
                      </TableCell>
                      <TableCell>
                        {member.FullName}
                      </TableCell>
                      <TableCell>
                        {member.RelationtoPA}
                      </TableCell>
                      <TableCell>
                        {member.Gender}
                      </TableCell>
                      <TableCell>
                        {member.BirthDate?.slice(0, 10)}
                      </TableCell>
                      <TableCell>
                        {age}
                      </TableCell>
                      <TableCell className="text-right font-semibold font-mono">
                        ${amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex justify-center">
                      
                         <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 "
                         onClick={() => handleRemoveMember(member.CaseMemberID)}
                          title="Remove client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption className="mt-8 font-bold text-right">
                Total Amount to Pay:
                <span className="ml-2 text-blue-700">
                  USD ${grandTotalUSD.toFixed(2)}
                </span>
                {exchangeRate && (
                  <span className="ml-2 text-green-700">
                    | NPR {grandTotalNPR?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                )}
              </TableCaption>
            </Table>
          </div>
          <Separator className="my-8" />
          <InputCol
            label="Remarks: "
            id="remarks"
            value={reference}
            isDisabled={false}
            placeholder="Remarks"
            className="w-full"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReference(e.target.value)
            }
          />
          <Separator className="my-16" />
          <div className="flex gap-6 mt-2 justify-between">
            <button
              onClick={handleQRGenerateAndCreatePayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="flex items-center justify-center h-12 w-[220px] rounded-md bg-brand-500 text-white font-bold text-base shadow-sm hover:bg-brand-600 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  GENERATE NEPAL QR
                  <QrCode className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCaseMembers(null);
                setReference("");
              }}
              className="flex items-center justify-center h-12 w-[140px] rounded-md border border-brand-700 text-brand-500 font-bold text-base bg-white hover:cursor-pointer hover:bg-blue-50 transition"
            >
              RESET FIELD
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function InputCol({
  label,
  id,
  value,
  placeholder,
  isDisabled = true,
  onChange = () => {},
  ...props
}: {
  label: string;
  value: string | number;
  id: string;
  placeholder: string;
  isDisabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex  gap-4 w-full max-w-sm my-6">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Input
        type="text"
        id={id}
        disabled={isDisabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}