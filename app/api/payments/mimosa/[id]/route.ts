import client from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(res: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

  console.log("Fetching case with ID:", id);

  try {
    const data = await client.request(
      readItems("Payments", {
        filter: { case_id: { _eq: id } }
      })
    );

    return NextResponse.json(data[0] ?? null, { status: 200 });

  } catch (error: unknown) {
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
