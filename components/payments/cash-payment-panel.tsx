"use client";
import { Input } from "@/components/ui/input";
import { CaseSearchCombobox, TCase } from "./search-mimosa-combobox";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Banknote } from "lucide-react";
import { createPayment, updateCaseStatus } from "@/app/server_actions";

export function CashPaymentPanel() {
  const [selectedCase, setSelectedCase] = useState<TCase | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  //

  async function handleCashPayment() {
    setLoading(true);
    try {
      // create payment record.

      const paymentRecord = {
        case_id: selectedCase?.id ?? "",
        amount_in_dollar: (
          Number(selectedCase?.package_price ?? 0) / 132
        ).toFixed(2), // example conversion
        amount_in_local_currency: selectedCase?.package_price ?? "0",
        type_of_payment: 3, // assuming 3 represents Cash Payment
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`, // example transaction ID
        status: 2, // initial status (e.g., payment completed)
        validationTraceId: "",
        payerInfo: selectedCase?.main_client.first_name + " " + selectedCase?.main_client.last_name,
        qr_timestamp: "",
        paidAmount: selectedCase?.package_price ?? "0",
        qr_string: "",
      };

      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      
      // update case status to "Paid"
      const updateRes = await updateCaseStatus({
        caseId: selectedCase?.id ?? "",
        case_status: 2, // assuming 2 represents "Paid"
      });

      if (!updateRes) {
        throw new Error("Failed to update case status");
      }

      // Redirect to confirmation page

      router.push(`/payments/cash/${selectedCase?.id}`);
    } catch (e: unknown) {
      alert("Failed to create payment record: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-3xl ">
      <CaseSearchCombobox setSelectedCase={setSelectedCase} type="mimosa" />
      <Separator className="my-8" />
      {selectedCase && (
        <>
          <InputCol
            label="Case ID"
            id="case_id"
            value={selectedCase.id ?? ""}
            placeholder="Case ID"
          />
          <InputCol
            label="Main Client"
            id="client"
            value={`${selectedCase.main_client.first_name} ${selectedCase.main_client.last_name}`}
            placeholder="Main Client"
          />
          <InputCol
            label="Amount To Pay"
            id="amount"
            value={Number(selectedCase.package_price)}
            placeholder="Amount To Pay "
          />
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
              disabled={loading}
              className="px-4 flex justify-center  py-4 rounded border border-blue-800 text-blue-800 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
            >
              {loading ? "Creating Payment Record..." : "Create Cash Payment"}
              <Banknote className="ml-2 text-blue-800" />
            </button>

            <button
              onClick={() => {
                setSelectedCase(null);
                setReference("");
              }}
              className="px-4 flex justify-center  py-4 rounded border border-red-700 text-red-700 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
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
    <>
      <div className="grid grid-cols-2  w-full max-w-sm items-center my-6">
        <Label htmlFor={id}>{label}</Label>
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
    </>
  );
}
