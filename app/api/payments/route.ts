// app/api/payments/route.ts
import { NextResponse } from "next/server";
import client from "@/lib/directus";
import {  readItems } from "@directus/sdk";


export async function GET(request: Request) {
 // Read the ?fromDate=YYYY-MM-DD parameter
    const { searchParams } = new URL(request.url);
    let fromDateParam = searchParams.get("fromDate");
    let toDateParam = searchParams.get("toDate");


    // if parameters are missing, set as today
    if (!fromDateParam || !toDateParam) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');

      fromDateParam = `${yyyy}-${mm}-${dd}`;
      toDateParam = `${yyyy}-${mm}-${dd}`;
    }

    


   // Create start and end of the day range
    const startOfDay = new Date(`${fromDateParam}T00:00:00`);
    const endOfDay = new Date(`${toDateParam}T23:59:59.999`);
  try {
    const data = await client.request(
      readItems("Payments", {
        filter: {
          _and: [
            {
              date_created: {
                _between: [
                  startOfDay.toISOString(), // e.g. "2025-10-05T00:00:00+03:00"
                  endOfDay.toISOString(),   // e.g. "2025-10-05T23:59:59.999+03:00"
                ],
              },
            },
          ],
        },
      
      })
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

