"use client";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useState } from "react";
import { createPayment } from "@/app/server_actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { TUKTB_Cases } from "@/lib/schema";
import { SearchUKTBCombobox } from "./search-uktbcase-combobox";
import { TNewPaymentRecord } from "@/app/types";

export function QrCodeUKTBPaymentPanel() {
  const [selectedCase, setSelectedCase] = useState<TUKTB_Cases | null>(null);
  const [ukTBCases, setUkCases] = useState<TUKTB_Cases[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //

  async function handleQRGenerateAndCreatePayment() {
    setLoading(true);
    try {
      // fetch directly here since we are in a client component
      const res = await fetch("/api/nepalpay/generateQR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: Number(selectedCase?.amount ?? 0),
          billNumber: selectedCase?.id ?? "N/A",
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(JSON.stringify(json));

      // check qr and validationTraceId exists
      if (!json?.data?.qrString || !json?.data?.validationTraceId) {
        throw new Error("Invalid response from QR generation API");
      }

      console.log("QR Generation Response:", json);

      const qrString = json.data?.qrString;
      const validationTraceId = json.data?.validationTraceId;
      const timestamp = json?.timestamp;

      // Total Amounts to pay
      const totalAmountToPayDollars = ukTBCases
        .reduce(
          (acc, client) => acc + Number(client.amount.replace(/[$,]/g, "")),
          0
        )
        .toFixed(2);
      const totalAmountToPayLocalCurrency = ukTBCases
        .reduce(
          (acc, client) => acc + Number(client.amount.replace(/[$,]/g, "")),
          0
        )
        .toFixed(2);

      // create payment record.

      console.log("case to pay:", selectedCase);

      const paymentRecord: TNewPaymentRecord = {
        case_number: selectedCase?.id ?? "",
        case_management_system: 2, // assuming 2 represents UKTB
        mimosa_case: null,
        reference: null,
        amount_in_dollar: totalAmountToPayDollars ?? "0",
        amount_in_local_currency: totalAmountToPayLocalCurrency ?? "0",
        type_of_payment: 2, // assuming 1 represents Nepal QR
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`, // example transaction ID
        status: 1, // initial status (e.g., payment initiated)
        validationTraceId: validationTraceId ?? "",
        payerInfo:
          selectedCase?.First_Name || "" + " " + selectedCase?.Last_Name || "",
        qr_timestamp: timestamp ?? "",
        paidAmount: selectedCase?.amount ?? "0",
        qr_string: qrString,
        wave: null,
        clinic: null,
      
      };

      
      // Create payment record in the database
      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      // make sure we set the qrString in expected shape

      router.push(`/payments/qrcode/${selectedCase?.id}?case_type=uktb`);
    } catch (e: unknown) {
      alert("Failed to generate QR: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // update UKTBCase state when case is selected
  useEffect(() => {
    if (selectedCase) {
      console.log("Selected case:", selectedCase);
      const exists = ukTBCases.find((c) => c.id === selectedCase.id);
      if (!exists) {
        setUkCases((prev) => [...prev, selectedCase]);
      }
    }
  }, [selectedCase]);

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-3xl min-h-[470px]">
      <SearchUKTBCombobox setSelectedCase={setSelectedCase} />
      <Separator className="my-8" />
      {selectedCase && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ukTBCases.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>
                    {client.First_Name} {client.Last_Name}
                  </TableCell>
                  <TableCell className="text-right">{client.amount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Input
                        className="p-2 w-auto ml-auto border-0 flex-1 text-center"
                        id={`${client.id}`}
                        type="text"
                        onChange={() => {}}
                        defaultValue=""
                        placeholder="add remark"
                      />
                      <span
                        onClick={() => {
                          // remove item with matching id from ukTBCases
                          const updatedCases = ukTBCases.filter(
                            (c) => c.id !== client.id
                          );

                          setUkCases(updatedCases);
                          console.log(updatedCases);
                        }}
                        className="text-red-500 hover:cursor-pointer  p-2"
                      >
                        ❌
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {ukTBCases.length > 0 && (
              <>
                <TableCaption className="mt-8 font-bold text-right">
                  Total Amount to Pay (NPR):{" "}
                  {ukTBCases
                    .reduce(
                      (acc, client) =>
                        acc + Number(client.amount.replace(/[$,]/g, "")),
                      0
                    )
                    .toFixed(2)}{" "}
                </TableCaption>
                
              </>
            )}
          </Table>
          <Separator className="my-16" />
          <div className="flex gap-6 mt-2 justify-between">
            <button
              onClick={handleQRGenerateAndCreatePayment}
              disabled={loading}
              className="flex items-center justify-center h-12 w-[220px] rounded-md bg-brand-500 text-white font-bold text-base shadow-sm hover:bg-brand-600 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? "GENERATING..." : "GENERATE NEPAL QR"}
              <QrCode className="ml-2 w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setSelectedCase(null);
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
