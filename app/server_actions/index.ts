"use server";

import client from "@/lib/directus";
import { createItem, readItems } from "@directus/sdk";
import {
  TTxnReportResponseSuccess,
  TCaseSearchResult,
  TNepalQRPayload,
  TNepalQRResponse,
  TPaymentPayload,
  TTxnReportResponseFailure,
} from "@/app/types";

// Fetch case list on the server (replace with your data source)
export async function getCases(): Promise<TCaseSearchResult[]> {
  // Example: fetch from DB or API
  const res = await fetch("https://your-api/cases");
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

// Generate QR on the server
export async function generateQr(
  payload: TNepalQRPayload
): Promise<TNepalQRResponse> {
  const res = await fetch("https://your-api/payments/nepalqr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.data ?? json;
}

export async function getPaymentByCaseIdAction(id: string) {
  console.log("Fetching case with ID:", id);

  try {
    const data = await client.request(
      readItems("Payments", {
        filter: { case_id: { _eq: id } },
      })
    );

    return data[0] ?? null;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error("Failed to fetch payment");
  }
}

export async function createPayment(body: TPaymentPayload) {
  console.log("Received payment data:", body);

  // ✅ Validate required fields
  if (!body.case_id || !body.amount_in_local_currency || !body.transaction_id) {
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

// Verify Payment Transaction

export async function verifyPaymentTxn({
  validationTraceId,
}: {
  validationTraceId: string;
}): Promise<TTxnReportResponseSuccess | TTxnReportResponseFailure | { error: string }> {
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
