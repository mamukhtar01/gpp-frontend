import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(res: NextRequest) {
  const { searchParams } = res.nextUrl; 

  try {
    const data = await client.request(
      readItems("Cases", {
        fields: ["id", "case_id", "main_client", "case_status", "package_price", "appointment_date", "date_created"],
        search: searchParams.get("search") || "",
        filter: {
          case_management_system: { _eq: 1 },
        },
        sort: "-date_created",
        limit: 15,
      })
    );

    return NextResponse.json(data, { status: 200 });

  } catch (error: unknown) {
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
