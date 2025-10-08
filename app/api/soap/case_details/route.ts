import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type CaseMemberDetailsRequest = {
  CaseNo: string;
};

// Types based on your given API response
export type CaseMember = {
  CaseMemberID: number;
  CaseNo: string;
  RelationtoPA: string;
  FullName: string;
  Age: number;
  AgeInYears: number;
  AgeInMonths: number;
  AgeInDays: number;
  BirthDate: string;
  Gender: string;
  LastName: string;
  FirstName: string;
  TravelRequirement: string;
  IsLoanRecipient: boolean;
  IsRegisteredByEMedical: boolean;
  TotalCosts: number;
  DateOfReturn: { ["xsi:nil"]: string } | string | null;
};

type CaseMemberResponse = {
  Errors: string;
  Warnings: string;
  DestinationCountry: string;
  OriginCountry: string;
  members: CaseMember[];
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const soapApiUrl = process.env.MIMOSA_SOAP_API_URL;

  if (!soapApiUrl) {
    return NextResponse.json(
      { error: "Server configuration error: MIMOSA_SOAP_API_URL is not set" },
      { status: 500 }
    );
  }

  try {
    let body: CaseMemberDetailsRequest;
    try {
      body = JSON.parse(await req.text());
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body?.CaseNo || typeof body.CaseNo !== "string" || body.CaseNo.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid required field: CaseNo" },
        { status: 400 }
      );
    }

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:RetrieveMigrantCaseByCaseNo>
         <tem:dataEntry>
            <tem:CaseNo>${body.CaseNo}</tem:CaseNo>
            <tem:CurrentUserName>mamukhtar</tem:CurrentUserName>
         </tem:dataEntry>
      </tem:RetrieveMigrantCaseByCaseNo>
   </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(soapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction:
          '"http://tempuri.org/ICaseManagementService/RetrieveMigrantCaseByCaseNo"',
        "User-Agent": "Apache-HttpClient/4.5.5 (Java/17.0.12)",
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `SOAP service error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    let parsed;
    try {
      parsed = parser.parse(xmlText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse SOAP XML response" },
        { status: 500 }
      );
    }

    // Drill down to the SOAP payload
    const result =
      parsed["s:Envelope"]?.["s:Body"]?.["RetrieveMigrantCaseByCaseNoResponse"]?.["RetrieveMigrantCaseByCaseNoResult"] ||
      parsed["Envelope"]?.["Body"]?.["RetrieveMigrantCaseByCaseNoResponse"]?.["RetrieveMigrantCaseByCaseNoResult"];

    if (!result) {
      return NextResponse.json(
        { error: "RetrieveMigrantCaseByCaseNoResult not found or invalid", debug: parsed },
        { status: 500 }
      );
    }

    // Format the response
    const Errors = result.Errors ?? "";
    const Warnings = result.Warnings ?? "";
    const migrantCase = result.MigrantCase ?? {};
    const caseMemberSummary = result.CaseMemberSummary ?? {};

    const membersRaw = caseMemberSummary?.CaseMemberSummary ?? [];
    // Ensure members is always an array
    const members: CaseMember[] = Array.isArray(membersRaw) ? membersRaw : [membersRaw].filter(Boolean);

    const DestinationCountry = migrantCase?.DestinationCountry ?? "";
    // You specified OriginCountry, but original code uses LocationCountry
    const OriginCountry = migrantCase?.LocationCountry ?? "";

    // Validate essential data
    if (!DestinationCountry || !OriginCountry) {
      return NextResponse.json(
        { error: "Incomplete case data", debug: { DestinationCountry, OriginCountry } },
        { status: 500 }
      );
    }

    const responsePayload: CaseMemberResponse = {
      Errors,
      Warnings,
      DestinationCountry,
      OriginCountry,
      members,
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}