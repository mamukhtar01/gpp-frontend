import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(res: NextRequest) {
  // Extract search params
  const { searchParams } = res.nextUrl;

  try {
    // fetch UKTB cases from Directus with optional search filtering
    const data = await client.request(
      readItems("UKTB_Cases", {
        fields: [
          "id",
          "visa_type",
          "native_name",
          "passport",
          "exam_date",
          "First_Name",
          "Last_Name",
          "Sex",
          "date_of_birth",
          "telephone",
          "amount",
          "appointment_date",
          "appointment_time",
          "location",
          "Country",
          "Currency",
        ],
        search: searchParams.get("search") || "",
        sort: "-date_created",
        limit: 10,
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
