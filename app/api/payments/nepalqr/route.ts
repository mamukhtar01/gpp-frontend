import { NextRequest, NextResponse } from "next/server";
import { buildBasicAuthHeader, buildTokenString, formatAmount2, loadPrivateKeyPEM, signTokenStringRSA256 } from "./util";

// --- API Route -------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const {
      // required by your flow
      pointOfInitialization, // 11 static, 12 dynamic
      acquirerId,
      merchantId,
      merchantName,
      merchantCategoryCode,
      merchantCountry,
      merchantCity,
      merchantPostalCode,
      merchantLanguage,
      transactionCurrency, // e.g. 524
      transactionAmount, // e.g. "10.00" (string) or number
      valueOfConvenienceFeeFixed,
      billNumber,
      referenceLabel,
      mobileNo,
      storeLabel,
      terminalLabel,
      purposeOfTransaction,
      additionalConsumerDataRequest,
      loyaltyNumber,
    } = await req.json();

    // 1) Build token string
    const userId = process.env.NEPALQR_USER_ID!;
    if (!userId) throw new Error("Missing NEPALQR_USER_ID env var");

    const tokenString = buildTokenString({
      acquirerId,
      merchantId,
      merchantCategoryCode,
      transactionCurrency,
      transactionAmount,
      billNumber,
      userId,
    });

    console.log(tokenString);

    // 2) Sign with SHA256withRSA using your private key (PEM)
    const privateKeyPem = loadPrivateKeyPEM();
    const token = signTokenStringRSA256(tokenString, privateKeyPem);

    console.log(token);

    // 3) Build request payload
    const payload: Record<string, unknown> = {
      pointOfInitialization,
      acquirerId,
      merchantId,
      merchantName,
      merchantCategoryCode,
      merchantCountry,
      merchantCity,
      merchantPostalCode,
      merchantLanguage,
      transactionCurrency,
      transactionAmount:
        pointOfInitialization === 12
          ? formatAmount2(transactionAmount ?? "0.00")
          : undefined, // often omitted for static
      valueOfConvenienceFeeFixed: valueOfConvenienceFeeFixed ?? "0.00",
      billNumber,
      referenceLabel: referenceLabel ?? null,
      mobileNo: mobileNo ?? null,
      storeLabel,
      terminalLabel,
      purposeOfTransaction,
      additionalConsumerDataRequest: additionalConsumerDataRequest ?? null,
      loyaltyNumber: loyaltyNumber ?? null,
      token, 
    };

    // Remove undefined fields cleanly
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    // 4) Call Nepal API
    const host = process.env.NEPALQR_URL!;
    if (!host) throw new Error("Missing NEPALQR_URL env var");

    const res = await fetch(`${host}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: buildBasicAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "NepalQR request failed", status: res.status, data },
        { status: res.status }
      );
    }

    // 5) Return to frontend (and/or persist in Directus here)
    //    data.data.validationTraceId, data.data.qrString, data.data.qrImage?
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("nepalqr route error:", err);
    return NextResponse.json(
      { error: err ?? "Internal error" },
      { status: 500 }
    );
  }
}
