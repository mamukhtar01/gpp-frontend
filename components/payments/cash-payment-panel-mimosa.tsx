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
import { Banknote, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TNewPaymentRecord } from "@/app/types";
import { CaseMember, CaseMemberSummarySearch } from "./search-mimosa-combobox";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import {
  CountryOfDestination,
  TCountryKey,
} from "./country-of-destination-select";
// US: Default Fee Table (your previous table)
function getUSFee(age: number) {
  if (age < 2) return 65;
  if (age >= 2 && age <= 14) return 130;
  if (age >= 15 && age <= 17) return 138;
  if (age >= 18 && age <= 24) return 173;
  if (age >= 25 && age <= 44) return 143;
  return 138; // 45+
}

// UK Fee Table
function getUKFee(age: number) {
  if (age < 11) return 40;
  return 60;
}

// Japan Fee Table
function getJapanFee(age: number) {
  if (age < 5) return 68;
  return 45;
}

// Australia Fee Table
function getAustraliaFee(age: number, specialType?: string) {
  if (specialType === "Aged Visitor") return 44;
  if (specialType === "Health Care Worker") return 49;
  if (age < 2) return 45;
  if (age < 5) return 45;
  if (age < 11) return 45;
  if (age < 15) return 43;
  if (specialType === "Health Care Worker") return 49;
  return 43;
}

// New Zealand Fee Table
function getNewZealandFee(age: number) {
  if (age < 5) return 40;
  if (age < 11) return 40;
  if (age < 15) return 40;
  return 50;
}

// Canada Fee Table
function getCanadaFee(age: number) {
  if (age < 2) return 35;
  if (age < 11) return 35;
  if (age < 15) return 40;
  return 40;
}

// Utility to calculate age from BirthDate (YYYY-MM-DD or ISO)
function calculateAge(birthDate: string) {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export function CashPaymentPanelMimosa() {
  const [country, setCountry] = useState<TCountryKey>(13);
  const [caseMembers, setCaseMembers] = useState<CaseMember[] | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const exchangeRate = useExchangeRate();

  // Remove a member from the table
  const handleRemoveMember = (id: number) => {
    setCaseMembers((prev) =>
      prev ? prev.filter((m) => m.CaseMemberID !== id) : prev
    );
  };

  // Country-specific fee calculation
  function getFee(age: number, specialType?: string) {
    if (country === 13) return getUSFee(age);
    if (country === 16) return getUKFee(age);
    if (country === 29) return getJapanFee(age);
    if (country === 14) return getAustraliaFee(age, specialType);
    if (country === 15) return getNewZealandFee(age);
    if (country === 12) return getCanadaFee(age);
    return 0;
  }

  // Total calculation (USD)
  const grandTotalUSD = useMemo(() => {
    if (!caseMembers) return 0;
    return caseMembers.reduce((sum, member) => {
      const age = calculateAge(member.BirthDate);
      return sum + getFee(age);
    }, 0);
  }, [caseMembers, country]);

  // Total calculation (NPR)
  const grandTotalNPR = useMemo(() => {
    if (!exchangeRate) return 0;
    return grandTotalUSD * exchangeRate;
  }, [grandTotalUSD, exchangeRate]);

  async function handleCashPayment() {
    setLoading(true);
    try {
      if (!caseMembers || caseMembers.length === 0)
        throw new Error("No case members selected.");
      if (!exchangeRate) throw new Error("Exchange rate is not available.");

      const caseNo = caseMembers[0].CaseNo;

      const paymentRecord: TNewPaymentRecord = {
        mimosa_case: null,
        case_number: caseNo,
        case_management_system: 1,
        reference: reference,
        amount_in_dollar: grandTotalUSD.toFixed(2),
        amount_in_local_currency: grandTotalNPR.toFixed(2),
        type_of_payment: 3, // Cash Payment
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 2, // Paid
        validationTraceId: "",
        payerInfo: caseMembers.map((m) => m.FullName).join(", "),
        qr_timestamp: "",
        paidAmount: grandTotalNPR.toFixed(2),
        qr_string: "",
        wave: null,
        clinic: null,
        service_type: "medical_exam",
        clients: caseMembers.map((m) => {
          const age = calculateAge(m.BirthDate);
          const feeUSD = getFee(age);
          return {
            id: m.CaseMemberID.toString(),
            name: m.FullName,
            age,
            amount: feeUSD.toFixed(2),
          };
        }),
      };

      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      router.push(`/payments/cash/${caseNo}`);
    } catch (e: unknown) {
      alert("Failed to create payment record: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Amount (USD)</TableHead>
                <TableHead className="text-right">Amount (NPR)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseMembers.map((member) => {
                const age = calculateAge(member.BirthDate);
                const amountUSD = getFee(age);
                const amountNPR = exchangeRate ? amountUSD * exchangeRate : 0;

                return (
                  <TableRow key={member.CaseMemberID}>
                    <TableCell>{member.CaseMemberID}</TableCell>
                    <TableCell>{member.FullName}</TableCell>
                    <TableCell>{member.RelationtoPA}</TableCell>
                    <TableCell>{member.Gender}</TableCell>
                    <TableCell>{member.BirthDate?.slice(0, 10)}</TableCell>
                    <TableCell>{age}</TableCell>
                    <TableCell className="text-right">
                      ${amountUSD.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {amountNPR.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveMember(member.CaseMemberID)}
                        title="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCaption className="mt-8 font-bold text-right">
              <span>
                Total Amount to Pay:{" "}
                <span className="text-blue-700">
                  USD ${grandTotalUSD.toFixed(2)}
                </span>
                {" | "}
                <span className="text-green-700">
                  NPR{" "}
                  {grandTotalNPR.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </span>
            </TableCaption>
          </Table>
          <Separator className="my-8" />
          <InputCol
            label="Reference"
            id="reference"
            value={reference}
            isDisabled={false}
            placeholder="Reference"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReference(e.target.value)
            }
          />
          <Separator className="my-16" />
          <div className="flex justify-between">
            <button
              onClick={handleCashPayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="px-4 flex justify-center py-4 rounded border border-blue-800 text-blue-800 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold items-center min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Payment Record...
                </>
              ) : (
                <>
                  Create Cash Payment
                  <Banknote className="ml-2 text-blue-800" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCaseMembers(null);
                setReference("");
              }}
              className="px-4 flex justify-center py-4 rounded border border-red-700 text-red-700 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
            >
              Reset Fields
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
    <div className="grid grid-cols-2  w-full max-w-sm items-center my-6">
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
