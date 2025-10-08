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
import { Banknote, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TNewPaymentRecord } from "@/app/types";
import {
  CaseMemberDetailsResponse,
  CaseMemberSummarySearch,
} from "./search-mimosa-combobox";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import {
  calculateAge,
  getAustraliaAgeBasedFee,
  getCanadaAgeBasedFee,
  getJapanAgeBasedFee,
  getNewZealandAgeBasedFee,
  getUKAgeBasedFee,
  getUSAgeBasedFee,
} from "@/lib/fee-utils";
import { getCountryIdFromCode } from "@/lib/utils";

// Aligning state with QR payment panel: using CaseMemberDetailsResponse instead of just array
export function CashPaymentPanelMimosa() {
  const [caseSearchResponse, setCaseSearchResponse] =
    useState<CaseMemberDetailsResponse | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const exchangeRate = useExchangeRate();

  // Remove a member from the table
  const handleRemoveMember = (id: number) => {
    setCaseSearchResponse((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.filter((m) => m.CaseMemberID !== id),
          }
        : prev
    );
  };

  // Country-specific fee calculation (using country select widget or details from search response)
  function getCountrySpecificFee(age: number, specialType?: string) {
    // Prefer country from details response if available, otherwise from dropdown

    if (caseSearchResponse?.DestinationCountry === "US")
      return getUSAgeBasedFee(age);
    if (caseSearchResponse?.DestinationCountry === "CA")
      return getCanadaAgeBasedFee(age);
    if (caseSearchResponse?.DestinationCountry === "AU")
      return getAustraliaAgeBasedFee(age, specialType);
    if (caseSearchResponse?.DestinationCountry === "NZ")
      return getNewZealandAgeBasedFee(age);
    if (caseSearchResponse?.DestinationCountry === "UK")
      return getUKAgeBasedFee(age);
    if (caseSearchResponse?.DestinationCountry === "JP")
      return getJapanAgeBasedFee(age);
    return 0;
  }

  // Total calculation (USD)
  const grandTotalUSD = useMemo(() => {
    if (!caseSearchResponse?.members) return 0;
    return caseSearchResponse.members.reduce((sum, member) => {
      const age = calculateAge(member.BirthDate);
      return sum + getCountrySpecificFee(age);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseSearchResponse?.members]);

  // Total calculation (NPR)
  const grandTotalNPR = useMemo(() => {
    if (!exchangeRate) return null;
    return grandTotalUSD * exchangeRate;
  }, [grandTotalUSD, exchangeRate]);

  async function handleCashPayment() {
    setLoading(true);
    try {
      if (
        !caseSearchResponse?.members ||
        caseSearchResponse.members.length === 0
      )
        throw new Error("No case members selected.");
      if (!exchangeRate) throw new Error("Exchange rate is not available.");

      const caseNo = caseSearchResponse.members[0].CaseNo;

      const paymentRecord: TNewPaymentRecord = {
        mimosa_case: null,
        case_number: caseNo,
        case_management_system: 1,
        reference: reference || null,
        amount_in_dollar: grandTotalUSD.toFixed(2),
        amount_in_local_currency: grandTotalNPR ? grandTotalNPR.toFixed(2) : "",
        type_of_payment: 3, // Cash Payment
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 2, // Paid
        validationTraceId: "",
        payerInfo: caseSearchResponse.members.map((m) => m.FullName).join(", "),
        qr_timestamp: "",
        paidAmount: grandTotalNPR ? grandTotalNPR.toFixed(2) : "",
        qr_string: "",
        wave: null,
        clinic: null,
        exchange_rate: exchangeRate,
        destination_country: getCountryIdFromCode(
          caseSearchResponse?.DestinationCountry
        ),
        clients: caseSearchResponse.members.map((m) => ({
          id: m.CaseMemberID.toString(),
          name: m.FullName,
          age: calculateAge(m.BirthDate),
          amount: getCountrySpecificFee(calculateAge(m.BirthDate)).toFixed(2),
          additional_services: null,
        })),
      };

      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      router.push(`/payments/cash/${caseNo}?paymentId=${paymentRes.id}`);
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

        {/* Country details */}
        {caseSearchResponse?.DestinationCountry &&
          caseSearchResponse?.OriginCountry && (
            <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-4">
              <p>
                Destination:{" "}
                <span className="font-bold">
                  {caseSearchResponse?.DestinationCountry}
                </span>
              </p>
              <p>
                Origin:{" "}
                <span className="font-bold">
                  {caseSearchResponse?.OriginCountry}
                </span>
              </p>
            </div>
          )}
      </div>

      <CaseMemberSummarySearch setSelectedSummary={setCaseSearchResponse} />
      <Separator className="my-8" />

      {caseSearchResponse?.members && caseSearchResponse.members.length > 0 && (
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
                  <TableHead className="w-[14%] text-right">
                    Amount (USD)
                  </TableHead>
                  <TableHead className="w-[10%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseSearchResponse.members.map((member) => {
                  const age = calculateAge(member.BirthDate);
                  const amount = getCountrySpecificFee(age);

                  return (
                    <TableRow key={member.CaseMemberID}>
                      <TableCell className="font-mono text-[11px]">
                        {member.CaseMemberID}
                      </TableCell>
                      <TableCell>{member.FullName}</TableCell>
                      <TableCell>{member.RelationtoPA}</TableCell>
                      <TableCell>{member.Gender}</TableCell>
                      <TableCell>{member.BirthDate?.slice(0, 10)}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell className="text-right font-semibold font-mono">
                        ${amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 "
                          onClick={() =>
                            handleRemoveMember(member.CaseMemberID)
                          }
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
                    | NPR{" "}
                    {grandTotalNPR?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
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
              onClick={handleCashPayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="flex items-center justify-center h-12 w-[220px] rounded-md bg-blue-800 text-white font-bold text-base shadow-sm hover:bg-blue-900 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Payment Record...
                </>
              ) : (
                <>
                  Create Cash Payment
                  <Banknote className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCaseSearchResponse(null);
                setReference("");
              }}
              className="flex items-center justify-center h-12 w-[140px] rounded-md border border-red-700 text-red-700 font-bold text-base bg-white hover:cursor-pointer hover:bg-red-50 transition"
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
