// app/api/payments/nepalqr/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Example: Expect amount and billNumber from frontend
    const {
      transactionAmount,
      billNumber,
    } = body;

    // Build payload
    const payload = {
      pointOfInitialization: 12,
      acquirerId: "00002501",
      merchantId: "2501ELFDRY2",
      merchantName: "Plazma Tech",
      merchantCategoryCode: 4121,
      merchantCountry: "NP",
      merchantCity: "Kathmandu",
      merchantPostalCode: "4600",
      merchantLanguage: "en",
      transactionCurrency: 524, // NPR
      transactionAmount,
      valueOfConvenienceFeeFixed: "0.00",
      billNumber,
      referenceLabel: null,
      mobileNo: null,
      storeLabel: "Store1",
      terminalLabel: "Terminal1",
      purposeOfTransaction: "Bill payment",
      additionalConsumerDataRequest: null,
      loyaltyNumber: null,
      token:
        "a1e0pTCtdgqny2BBPgKT/9EaLrRA0J99PYlNyjM5887nkebzvaKtsHT/aciZxXmqsnYMnktXJmseFIsiyE+06476RXrQaCNLEZ4LvsraSz5VWrb/ysA5HgFMqcXyRVCYkC4Ye5Uqbi87wbEyj1bb6Cb2yqDAOGm4uGmn7T5W9Gc=",
    };

    // Call external Nepal QR API
    const response = await fetch("https://<host:port>/qr/generateQR", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.NEPALQR_AUTH}`, // store in .env
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("NepalQR Error:", error);
    return NextResponse.json(
      { error: "NepalQR integration failed", details: error },
      { status: 500 }
    );
  }
}
