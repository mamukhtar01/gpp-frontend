import { TCaseSearchResult, TNepalQRPayload, TNepalQRResponse } from "../types";

// Fetch case list on the server (replace with your data source)
export async function getCases(): Promise<TCaseSearchResult[]> {
  // Example: fetch from DB or API
  const res = await fetch("https://your-api/cases");
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

// Generate QR on the server
export async function generateQr(payload: TNepalQRPayload): Promise<TNepalQRResponse> {
  const res = await fetch("https://your-api/payments/nepalqr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.data ?? json;
}