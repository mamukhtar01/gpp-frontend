"use server";

import client from "@/lib/directus";
import { createItem, readItems, updateItem } from "@directus/sdk";
import {
  TTxnReportResponseSuccess,
  TTxnReportResponseFailure,
  TNewPaymentRecord,
  TPaymentType,
} from "@/app/types";
import { mapToUKTBCases } from "@/lib/utils";

// Case Actions

export async function updateCaseStatus({
  caseId,
  case_status,
}: {
  caseId: string;
  case_status: number;
}) {
  console.log("Updating case status:", { caseId, case_status });

  try {
    const response = await client.request(
      updateItem("Cases", caseId, { case_status })
    );
    return response;
  } catch (error) {
    console.error("Error updating case status:", error);
    throw new Error("Failed to update case status");
  }
}

// create a function to upload UKTB cases from excel file
export async function uploadUKTBCases(data: string[][]) {
  if (data.length === 0 || data[0].length === 0) {
    throw new Error("No data to upload");
  }

  try {
    const cases = mapToUKTBCases(data);

    // Create each case individually because createItem expects a single item
    const responses = await Promise.all(
      cases.map((caseItem) =>
        client.request(createItem("UKTB_Cases", caseItem))
      )
    );
    return responses;
  } catch (error) {
    console.error("Error uploading UKTB cases:", error);
    throw new Error("Failed to upload UKTB cases");
  }
}

// Payment Actions

export async function getPaymentsAction() {
  try {
    const data = await client.request(
      readItems("Payments", {
        fields: ["*"],
        sort: ["-date_created"],
      })
    );

    return data ?? null;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error("Failed to fetch payment");
  }
}

export async function getPaymentByCaseIdAction({
  paymentId,
  caseNo,
  paymentType,
}: {
  paymentId: string;
  caseNo: string;
  paymentType: TPaymentType;
}) {
  try {
    const data = await client.request(
      readItems("Payments", {
        filter: {
          case_number: { _eq: caseNo },
          id: { _eq: paymentId },
          type_of_payment: { _eq: paymentType as number },
        },
      })
    );

    return data[0] ?? null;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error("Failed to fetch payment");
  }
}

export async function createPayment(body: TNewPaymentRecord) {
  // ✅ Validate required fields
  if (
    !body.case_number ||
    !body.amount_in_local_currency ||
    !body.transaction_id
  ) {
    throw new Error("Missing required fields");
  }

  try {
    const response = await client.request(createItem("Payments", body));
    return response;
  } catch (error) {
    console.error("Error saving payment data:", error);
    throw new Error("Failed to save payment data");
  }
}

// Update Payment Status

export async function updatePaymentStatus({
  paymentId,
  status,
  payerInfo,
}: {
  paymentId: string;
  payerInfo: string;
  status: number;
}) {
  console.log("Updating payment status:", { paymentId, status });

  try {
    const response = await client.request(
      updateItem("Payments", paymentId, { status, payerInfo })
    );
    return response;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Failed to update payment status");
  }
}

// Verify Payment Transaction

export async function verifyPaymentTxn({
  validationTraceId,
}: {
  validationTraceId: string;
}): Promise<
  TTxnReportResponseSuccess | TTxnReportResponseFailure | { error: string }
> {
  try {
    const username = process.env.NEPALQR_USERNAME;
    const password = process.env.NEPALQR_PASSWORD;
    const URL = process.env.NEPALQR_VERIFY_URL;
    const acquirerId = process.env.ACQUIRERID;
    const merchantId = process.env.MERCHANTCODE;

    if (!URL) {
      return { error: "Verification URL not configured" };
    }

    if (!username || !password) {
      return { error: "Missing authentication credentials" };
    }

    // Build request payload
    const payload = {
      acquirerId: acquirerId,
      merchantId: merchantId,
      validationTraceId: validationTraceId,
    };

    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const json: TTxnReportResponseSuccess = await res.json();

    if (!res.ok) {
      return { error: json.responseMessage || "Failed to verify QR" };
    }

    return json;
  } catch (error) {
    console.error("Error verifying QR:", error);
    return { error: "Internal Server Error" };
  }
}
