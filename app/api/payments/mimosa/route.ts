// API route for handling payments


import { NextResponse } from "next/server";
import client from "@/lib/directus";
import { createItem } from "@directus/sdk";


// POST /api/payments to save payment data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received payment data:", body);
    // Validate required fields
    if (!body.case_id || !body.amount_in_local_currency || !body.transaction_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await client.request(
      createItem("Payments", body)
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error saving payment data:", error);
    return NextResponse.json({ error: "Failed to save payment data" }, { status: 500 });
  }
}
