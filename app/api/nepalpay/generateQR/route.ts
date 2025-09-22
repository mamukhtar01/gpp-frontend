import { NextRequest, NextResponse } from "next/server";
import {
  buildBasicAuthHeader,
  buildTokenString,
  formatAmount2,
  loadPrivateKeyPEM,
  signTokenStringRSA256,
} from "./util";

// --- API Route -------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const {
      transactionCurrency, // e.g. 524
      transactionAmount,
      billNumber,
      referenceLabel,    
      storeLabel,
      terminalLabel,
      purposeOfTransaction,      
    } = await req.json();

    // api static values
    const acquirerId = process.env.ACQUIRERID!;
    const merchantId = process.env.MERCHANTCODE!;
    const merchantName = process.env.MERCHANTNAME!;
    const merchantCategoryCode = process.env.MERCHANTCATEGORYCODE!;
    const merchantCountry = process.env.MERCHANTCOUNTRY!;
    const merchantCity = process.env.MERCHANTCITY!;
    const merchantPostalCode = process.env.MERCHANTPOSTALCODE!;
    const merchantLanguage = process.env.MERCHANTLANGUAGE!;

    if (
      !acquirerId ||
      !merchantId ||
      !merchantCategoryCode ||
      !merchantCountry ||
      !merchantCity ||
      !merchantPostalCode ||
      !merchantLanguage
    ) {
      throw new Error("Missing one or more NEPALQR static env vars");
    }

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
   

    // 2) Sign with SHA256withRSA using your private key (PEM)
    const privateKeyPem = loadPrivateKeyPEM();
    const token = signTokenStringRSA256(tokenString, privateKeyPem);

    
    // 3) Build request payload
    const payload: Record<string, unknown> = {
      pointOfInitialization: 12,
      acquirerId,
      merchantId,
      merchantName,
      merchantCategoryCode,
      merchantCountry,
      merchantCity,
      merchantPostalCode,
      merchantLanguage,
      transactionCurrency,
      transactionAmount: formatAmount2(transactionAmount ?? "0.00"),
      billNumber,
      referenceLabel: referenceLabel ?? null,      
      storeLabel,
      terminalLabel,
      purposeOfTransaction,      
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
