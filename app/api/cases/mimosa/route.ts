import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(res: NextRequest) {
  // Extract search params
  const { searchParams } = res.nextUrl;
 
  try {
    // Fetch cases from Directus with optional search filtering, where case_status == 1 (payment needed)
    // and case_management_system == 1 (MiMOSA)
    const data = await client.request(
      readItems("Cases", {
        fields: [
          "id",
          "case_id",
          "case_status",
          "package_price",
          "appointment_date",
          "date_created",
          "amount_to_pay_in_dollar",
          "amount_to_pay_in_local_currency",
          "local_currency",
          {
            main_client: ["id", "first_name", "last_name"],
          },
        ],
        search: searchParams.get("search") || "",
        filter: {
          case_management_system: { _eq: 1 },
          case_status: { _eq: 1 },
        },
        sort: "-date_created",
        limit: 15,
      })
    );

  //  console.log("Fetched cases:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error) {
      console.error("Error fetching cases:", error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
