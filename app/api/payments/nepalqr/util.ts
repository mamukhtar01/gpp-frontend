import crypto from "crypto";

export function formatAmount2(amount: string | number) {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(n)) throw new Error("Invalid transactionAmount");
  return n.toFixed(2);
}


export function buildTokenString(params: {
  acquirerId: string;
  merchantId: string;
  merchantCategoryCode: number | string;
  transactionCurrency: number | string;
  transactionAmount?: string | number; // required for dynamic
  billNumber: string;
  userId: string;
}) {
  const {
     acquirerId,
    merchantId,
    merchantCategoryCode,
    transactionCurrency,
    transactionAmount,
    billNumber,
    userId,
  } = params;

  const mcc = String(merchantCategoryCode);
  const curr = String(transactionCurrency);


  
    if (transactionAmount == null) {
      throw new Error("transactionAmount is required for dynamic QR (12)");
    }

    const amt = formatAmount2(transactionAmount);

    return `${acquirerId},${merchantId},${mcc},${curr},${amt},${billNumber},${userId}`;
}


export function loadPrivateKeyPEM(): string {
  const b64 = process.env.NEXT_PRIVATE_KEY_PEM_B64;
  if (!b64) throw new Error("Missing NEXT_PRIVATE_KEY_PEM_B64 env var");
  return Buffer.from(b64, "base64").toString("utf8");
}


export function signTokenStringRSA256(
  tokenString: string,
  privateKeyPem: string
): string {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(tokenString, "utf8");
  signer.end();
  return signer.sign(privateKeyPem).toString("base64");
}

export function buildBasicAuthHeader() {
  const user = process.env.NEPALQR_USERNAME!;
  const pass = process.env.NEPALQR_PASSWORD!;
  if (!user || !pass)
    throw new Error("Missing NEPALQR_USERNAME or NEPALQR_PASSWORD");
  const b64 = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${b64}`;
}