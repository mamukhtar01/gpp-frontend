"use client";
import { useState, useMemo } from "react";
import { Separator } from "@radix-ui/react-separator";
import { createPayment, updateCaseStatus } from "@/app/server_actions";
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
import { Banknote, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { TNewPaymentRecord } from "@/app/types";
import { CaseMember, CaseMemberSummarySearch } from "./search-mimosa-combobox";

// Age-based fee calculation
function getAmountByAge(age: number) {
  // Example: Under 5 = $20, 5-15 = $30, above 15 = $50
  if (age < 5) return 20;
  if (age <= 15) return 30;
  return 50;
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

export function CashPaymentPanel() {
  const [caseMembers, setCaseMembers] = useState<CaseMember[] | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Remove a member from the table
  const handleRemoveMember = (id: number) => {
    setCaseMembers((prev) => (prev ? prev.filter((m) => m.CaseMemberID !== id) : prev));
  };

  // Total calculation
  const grandTotal = useMemo(() => {
    if (!caseMembers) return 0;
    return caseMembers.reduce((sum, member) => {
      const age = calculateAge(member.BirthDate);
      return sum + getAmountByAge(age);
    }, 0);
  }, [caseMembers]);

  async function handleCashPayment() {
    setLoading(true);
    try {
      if (!caseMembers || caseMembers.length === 0) throw new Error("No case members selected.");

      // Use the CaseNo from the first member, adjust if needed
      const caseNo = caseMembers[0].CaseNo;

      // create payment record.
      const paymentRecord: TNewPaymentRecord = {
        mimosa_case: caseNo,
        case_number: caseNo,
        case_management_system: 1,
        reference: reference,
        amount_in_dollar: (grandTotal / 132).toFixed(2),
        amount_in_local_currency: grandTotal.toString(),
        type_of_payment: 3, // Cash Payment
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 2, // Paid
        validationTraceId: "",
        payerInfo: caseMembers.map(m => m.FullName).join(", "),
        qr_timestamp: "",
        paidAmount: grandTotal.toString(),
        qr_string: "",
        wave: null,
        clinic: null,
        clients: caseMembers.map(m => ({
          id: m.CaseMemberID.toString(),
          name: m.FullName,
          age: calculateAge(m.BirthDate),
          amount: getAmountByAge(calculateAge(m.BirthDate)).toFixed(2),
        })),
      };

      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      // update case status to "Paid"
      const updateRes = await updateCaseStatus({
        caseId: caseNo,
        case_status: 2, // assuming 2 represents "Paid"
      });

      if (!updateRes) {
        throw new Error("Failed to update case status");
      }

      // Redirect to confirmation page
      router.push(`/payments/cash/${caseNo}`);
    } catch (e: unknown) {
      alert("Failed to create payment record: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-3xl">
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
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseMembers.map((member) => {
                const age = calculateAge(member.BirthDate);
                const amount = getAmountByAge(age);

                return (
                  <TableRow key={member.CaseMemberID}>
                    <TableCell>{member.CaseMemberID}</TableCell>
                    <TableCell>{member.FullName}</TableCell>
                    <TableCell>{member.RelationtoPA}</TableCell>
                    <TableCell>{member.Gender}</TableCell>
                    <TableCell>{member.BirthDate?.slice(0, 10)}</TableCell>
                    <TableCell>{age}</TableCell>
                    <TableCell className="text-right">${amount.toFixed(2)}</TableCell>
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
              Total Amount to Pay (USD): {grandTotal.toFixed(2)}
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
              disabled={loading || grandTotal <= 0}
              className="px-4 flex justify-center py-4 rounded border border-blue-800 text-blue-800 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
            >
              {loading ? "Creating Payment Record..." : "Create Cash Payment"}
              <Banknote className="ml-2 text-blue-800" />
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