import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type CaseMemberSummaryRequest = {
  CaseNo: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CaseMemberSummaryRequest = JSON.parse(await req.text());

    if (!body.CaseNo) {
      return NextResponse.json({ error: "Missing required field: CaseNo" }, { status: 400 });
    }

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:RetrieveCaseMemberSummary>
      <tem:dataEntry>
        <tem:CaseNo>${body.CaseNo}</tem:CaseNo>
      </tem:dataEntry>
    </tem:RetrieveCaseMemberSummary>
  </soapenv:Body>
</soapenv:Envelope>`;

// todo. only authenticated users should call the api. 

    const response = await fetch("https://k-apiqaz.iom.int/mwebsvc/CaseManagementService.svc", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": "\"http://tempuri.org/ICaseManagementService/RetrieveCaseMemberSummary\"",
        "User-Agent": "Apache-HttpClient/4.5.5 (Java/17.0.12)",
      },
      body: soapEnvelope,
    });

    const xmlText = await response.text();

    // Parse the XML response
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const parsed = parser.parse(xmlText);

    // Extract the RetrieveCaseMemberSummaryResult (adjust if your actual XML path is different!)
    const result =
      parsed["s:Envelope"]?.["s:Body"]?.["RetrieveCaseMemberSummaryResponse"]?.["RetrieveCaseMemberSummaryResult"] ||
      parsed["soap:Envelope"]?.["soap:Body"]?.["RetrieveCaseMemberSummaryResponse"]?.["RetrieveCaseMemberSummaryResult"] ||
      parsed["Envelope"]?.["Body"]?.["RetrieveCaseMemberSummaryResponse"]?.["RetrieveCaseMemberSummaryResult"];

    if (!result) {
      return NextResponse.json({ error: "RetrieveCaseMemberSummaryResult not found", debug: parsed }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}