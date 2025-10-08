import { NextResponse } from "next/server";
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { TClientBasicInfo } from "@/app/types";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let fromDateParam = searchParams.get("fromDate");
  let toDateParam = searchParams.get("toDate");

  // If parameters are missing, set as today
  if (!fromDateParam || !toDateParam) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    fromDateParam = `${yyyy}-${mm}-${dd}T00:00:00Z`;
    toDateParam = `${yyyy}-${mm}-${dd}T23:59:59Z`;
  }



  const startOfDay = new Date(`${fromDateParam}`);
  const endOfDay = new Date(`${toDateParam}`);
  

  // Validation: date logic
  if (startOfDay > endOfDay) {
    return NextResponse.json(
      { error: "fromDate must be before or equal to toDate." },
      { status: 400 }
    );
  }
  

  try {
    const data = await client.request(
      readItems("Payments", {
        fields: ["id", "case_number", "clients"],
        filter: {
          service_type: "vaccination",
          _and: [
            {
              date_created: {
                _between: [
                  startOfDay.toISOString(),
                  endOfDay.toISOString(),
                ],
              },
            },
          ],
        },
      })
    );

    // Validation: Check if data is array and non-empty
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No payment data found for the given date range.", data: [] },
        { status: 404 }
      );
    }

    // Optionally validate payment and client structure
    for (const payment of data) {
      if (!payment.id || !payment.case_number || !Array.isArray(payment.clients)) {
        return NextResponse.json(
          { error: "Malformed payment data detected.", data },
          { status: 500 }
        );
      }
    }

    const summarized = aggregateVaccinations(data);

    // Validation: summarized result should be non-empty
    if (!Array.isArray(summarized) || summarized.length === 0) {
      return NextResponse.json(
        { error: "No vaccination summary found in payments.", data: [] },
        { status: 404 }
      );
    }

    return NextResponse.json(summarized, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

type TResponse = {
  id: string;
  case_number: string;
  clients: TClientBasicInfo[] | null;
};

// Example conversion rate, update as needed.
// todo: Fetch live rates from a reliable API if needed.
const USD_TO_NPR = 141.70; // Use latest USD-NPR rate

export function aggregateVaccinations(payments: TResponse[]) {
  const vaccineMap: Record<string, { 
    vaccination: string,
    unit: number,
    rate: string,
    totalAmount: number,
    nprAmount: number
  }> = {};

  for (const payment of payments) {
    for (const client of payment.clients ?? []) {
      for (const svc of client.additional_services ?? []) {
        const key = svc.service_name;
        const rate = parseFloat(svc.fee_amount_usd);

        if (!vaccineMap[key]) {
          vaccineMap[key] = {
            vaccination: key,
            unit: 0,
            rate: `$${rate.toFixed(2)}`,
            totalAmount: 0,
            nprAmount: 0,
          };
        }
        vaccineMap[key].unit += 1;
        vaccineMap[key].totalAmount += rate;
        vaccineMap[key].nprAmount += rate * USD_TO_NPR;
      }
    }
  }

  // Format output
  return Object.values(vaccineMap).map(v => ({
    vaccination: v.vaccination,
    unit: v.unit,
    rate: v.rate,
    totalAmount: `$${v.totalAmount.toFixed(2)}`,
    nprAmount: v.nprAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }));
}