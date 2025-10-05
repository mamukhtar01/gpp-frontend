import { NextRequest, NextResponse } from "next/server";
import { readItems } from "@directus/sdk";
import client from "@/lib/directus";

// API expects: POST (or GET) with JSON body or query params: { countryCode, serviceType }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const countryCode = Number(searchParams.get("countryCode"));
    const type = searchParams.get("serviceType") as
      | "medical_exam"
      | "vaccination"
      | "special_service"
      | "excluded_med_exam"; // new type for additional services excluding medical exam

    if (!countryCode || !type) {
      return NextResponse.json(
        { error: "Missing countryCode or serviceType" },
        { status: 400 }
      );
    }

    const data = await client.request(
      readItems("fee_structures", {
        fields: [
          "id",
          "fee_amount_usd",
          "min_age_months",
          "max_age_months",
          {
            service_type_code: ["service_code", "category", "service_name"],
          },
        ],
        filter: {
          country_id: { _eq: countryCode },
          service_type_code: {
            service_code: { _neq: "MED_EXAM" },
          },

          is_active: { _eq: true },
        },
        sort: ["min_age_months"],
      })
    );

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
      { status: 500 }
    );
  }
}
