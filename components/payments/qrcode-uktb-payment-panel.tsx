"use client";
import { Input } from "@/components/ui/input";
import { CaseSearchCombobox, TCase } from "./case-search-combobox";
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

export interface TUKTBCase {
  id: string;
  main_client: {
    id: string;
    first_name: string;
    last_name: string;
  };
  amountToPayDollars: string | "";
  amountToPayLocalCurrency: string | "";
  localCurrency: string | "";
  remark: string;
}

export function QrCodeUKTBPaymentPanel() {
  const [selectedCase, setSelectedCase] = useState<TCase | null>(null);
  const [ukTBCases, setUkCases] = useState<TUKTBCase[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  //

  async function handleQRGenerateAndCreatePayment() {
    setLoading(true);
    try {
      /*
      // fetch directly here since we are in a client component
      const res = await fetch("/api/payments/nepalqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: Number(selectedCase?.package_price ?? 0),
          billNumber: reference,
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

      */
      // create sample qrcode data
      const qrData = {
        qrString:
          "00020101021129370016A0000006770101110113006600000000023031343030303030303030303030303030303030303030303030305204000053039865407.005802NP5913GPP TESTING6008Kathmandu61051000162290525Test Reference1236304B14",
        validationTraceId: "VALIDATION_TRACE_ID",
        timestamp: new Date().toISOString(),
      };

      const { qrString, validationTraceId, timestamp } = qrData;

        // Total Amounts to pay
      const totalAmountToPayDollars = ukTBCases
        .reduce(
          (acc, client) => 
            acc + Number(client.amountToPayDollars.replace(/[$,]/g, "")),
          0
        )
        .toFixed(2);
      const totalAmountToPayLocalCurrency = ukTBCases
        .reduce(
          (acc, client) =>
            acc + Number(client.amountToPayLocalCurrency.replace(/[$,]/g, "")),
          0
        )
        .toFixed(2);



      // create payment record.

      const paymentRecord = {
        case_id: selectedCase?.id ?? "",
        amount_in_dollar: totalAmountToPayDollars ?? "0",
        amount_in_local_currency: totalAmountToPayLocalCurrency ?? "0",
        type_of_payment: 2, // assuming 1 represents Nepal QR
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`, // example transaction ID
        status: 1, // initial status (e.g., payment initiated)
        validationTraceId: validationTraceId ?? "",
        payerInfo: selectedCase?.main_client.first_name + " " + selectedCase?.main_client.last_name || "",
        qr_timestamp: timestamp ?? "",
        paidAmount: selectedCase?.package_price ?? "0",
        qr_string: qrString,
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
        setUkCases((prev) => [
          ...prev,
          {
            id: selectedCase.id,
            main_client: selectedCase.main_client,
            amountToPayDollars: (
              selectedCase.amount_to_pay_in_dollar ?? ""
            ).toString(),
            amountToPayLocalCurrency: (
              selectedCase.amount_to_pay_in_local_currency ?? ""
            ).toString(),
            localCurrency: (selectedCase.local_currency ?? "").toString(),
            remark: "",
          },
        ]);
      }
    }
   
  }, [selectedCase]);

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-3xl min-h-[470px]">
      <CaseSearchCombobox setSelectedCase={setSelectedCase} type="uktb" />
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
                    {client.main_client.first_name}{" "}
                    {client.main_client.last_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.amountToPayDollars}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Input
                        className="p-2 w-auto ml-auto border-0 flex-1 text-center"
                        id={`${client.id}`}
                        type="text"
                        onChange={(e) => {}}
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
                  Total Amount to Pay (USD):{" "}
                  {ukTBCases
                    .reduce(
                      (acc, client) =>
                        acc +
                        Number(client.amountToPayDollars.replace(/[$,]/g, "")),
                      0
                    )
                    .toFixed(2)}{" "}
                </TableCaption>
                <TableCaption className="mt-8 text-gray-500 text-right">
                  Total Amount in Local Currency:{" "}
                  <span className="font-bold text-gray-600">
                    {ukTBCases
                      .reduce(
                        (acc, client) =>
                          acc +
                          Number(
                            client.amountToPayLocalCurrency.replace(/[$,]/g, "")
                          ),
                        0
                      )
                      .toFixed(2)}{" "}
                  </span>
                </TableCaption>
                <TableCaption className="  mt-auto text-gray-500 text-right italic text-xs">
                  Nepalese Rupee (NPR)
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
