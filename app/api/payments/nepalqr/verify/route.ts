import { TNepalTxnVerifyPayload, TTxnReportResponse } from "@/app/types";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const payload: TNepalTxnVerifyPayload = await request.json();
    const username = process.env.NEPALQR_USERNAME;
    const password = process.env.NEPALQR_PASSWORD;
    const URL = process.env.NEPALQR_VERIFY_URL;

    if (!URL) {
        return NextResponse.json({ error: "Verification URL not configured" }, { status: 500 });
    }

    if (!username || !password) {
        return NextResponse.json({ error: "Missing authentication credentials" }, { status: 500 });
    }
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const json:  TTxnReportResponse= await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.responseMessage || "Failed to verify QR" }, { status: res.status });
    }

    return NextResponse.json(json);
    } catch (error) {
        console.error("Error verifying QR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}