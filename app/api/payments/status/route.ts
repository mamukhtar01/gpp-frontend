// app/api/payments/route.ts
import { NextResponse } from "next/server";
import client from "@/lib/directus";
import {  readItems } from "@directus/sdk";

// --- API Route  -- GET Payments ---------------------------------------------

export async function GET() {
  try {
    const data = await client.request(
      readItems("Payments", {
        fields: ["*"],
        sort: ["-date_created"],
      })
    );

    return NextResponse.json(data ?? null, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}
