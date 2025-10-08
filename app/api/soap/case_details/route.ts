import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type CaseMemberSummaryRequest = {
  CaseNo: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {

  const soapApiUrl = process.env.MIMOSA_SOAP_API_URL; 

  // Validate that the SOAP API URL is configured
  if (!soapApiUrl) {
    return NextResponse.json(
      { error: "Server configuration error: MIMOSA_SOAP_API_URL is not set" },
      { status: 500 }
    );
  }


  try {
    let body: CaseMemberSummaryRequest;
    try {
      body = JSON.parse(await req.text());
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !body.CaseNo || typeof body.CaseNo !== "string" || body.CaseNo.trim() === "") {
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
         <!--Optional:-->
         <tem:dataEntry>
            <!--Optional:-->
            <tem:CaseNo>${body.CaseNo}</tem:CaseNo>
            <!--Optional:-->
            <tem:CurrentUserName>mamukhtar</tem:CurrentUserName>
         </tem:dataEntry>
      </tem:RetrieveMigrantCaseByCaseNo>
   </soapenv:Body>
</soapenv:Envelope>`;

    // todo. only authenticated users should call the api.

    const response = await fetch(
      soapApiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction:
            '"http://tempuri.org/ICaseManagementService/RetrieveMigrantCaseByCaseNo"',
          "User-Agent": "Apache-HttpClient/4.5.5 (Java/17.0.12)",
        },
        body: soapEnvelope,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `SOAP service error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // Parse the XML response
    let parsed;
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });
      parsed = parser.parse(xmlText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse SOAP XML response" },
        { status: 500 }
      );
    }

    // Extract the RetrieveMigrantCaseByCaseNoResult from the SOAP response
    const result =
      parsed["s:Envelope"]?.["s:Body"]?.["RetrieveMigrantCaseByCaseNoResponse"]?.["RetrieveMigrantCaseByCaseNoResult"] ||
      parsed["Envelope"]?.["Body"]?.["RetrieveMigrantCaseByCaseNoResponse"]?.["RetrieveMigrantCaseByCaseNoResult"];

    if (!result || typeof result !== "object") {
      return NextResponse.json(
        { error: "RetrieveMigrantCaseByCaseNoResult not found or invalid", debug: parsed },
        { status: 500 }
      );
    }

    // Validate MigrantCase
    if (!result.MigrantCase || typeof result.MigrantCase !== "object") {
      return NextResponse.json(
        { error: "MigrantCase not found in response", debug: result },
        { status: 500 }
      );
    }

    // Validate CaseMemberSummary
    if (!result.CaseMemberSummary || typeof result.CaseMemberSummary !== "object") {
      return NextResponse.json(
        { error: "CaseMemberSummary not found in response", debug: result },
        { status: 500 }
      );
    }

    // Extract case members, destination country, and origin country
    const caseMembers = result.CaseMemberSummary?.CaseMemberSummary || [];
    const destinationCountry = result.MigrantCase?.DestinationCountry || null;
    const originCountry = result.MigrantCase?.LocationCountry || null;

    // Normalize caseMembers to always be an array and filter invalid members
    let members = Array.isArray(caseMembers) ? caseMembers : [caseMembers];
    members = members.filter(
      (m) => m && typeof m === "object" && m.CaseMemberID && m.FullName
    );

    // Reconstruct the response
    const reconstructed = {
      caseNo: result.MigrantCase?.CaseNo || null,
      destinationCountry,
      originCountry,
      members,
    };

    // Final validation: must have caseNo, destinationCountry, originCountry, and at least one member
    if (!reconstructed.caseNo || !reconstructed.destinationCountry || !reconstructed.originCountry || reconstructed.members.length === 0) {
      return NextResponse.json(
        { error: "Incomplete case data", debug: reconstructed },
        { status: 500 }
      );
    }

    return NextResponse.json(reconstructed);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
