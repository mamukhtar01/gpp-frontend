import { PaymentRecord } from "@/app/payments/types";
import { verifyPaymentTxn } from "@/app/server_actions";
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

export default async function CasePaymentPage({
  params,
}: {
  params: { case_id: string };
}) {
  const { case_id } = await params;

  console.log("Fetching payment data for case_id:", case_id);

  const response = await client.request<PaymentRecord[]>(
    readItems("Payments", {
      filter: { case_id: { _eq: case_id } },
    })
  );

  const validationTraceId = response[0].validationTraceId;

  if (!validationTraceId) {
    throw new Error("No validationTraceId found for this payment.");
  }

  // Verify payment status

  const transctionReport = await verifyPaymentTxn({
    validationTraceId
  });

  if (!transctionReport) {
    throw new Error("Failed to verify payment transaction.");
  }

  console.log("Transaction Report:", transctionReport);

  const data = response.length > 0 ? response[0] : null;

  return (
    <div>
      <h1>Case Details</h1>
      {data ? (
        <div>
          <h2>Case_ID: {data.case_id}</h2>
          <p>{data.amount_in_local_currency}</p>
          <p>Status: {data.status}</p>
        </div>
      ) : (
        <p>No case details found.</p>
      )}
    </div>
  );
}
