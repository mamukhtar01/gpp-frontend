import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type MedicalRecordRequest = {
  CaseMemberID: number;
  CurrentUser: string;
  MissionCode: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: MedicalRecordRequest = JSON.parse(await req.text());

    if (!body.CaseMemberID || !body.CurrentUser || !body.MissionCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const caseMemberIdNum = body.CaseMemberID;

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:RetrieveMedicalRecord>
      <tem:dataEntry>
        <tem:CurrentUser>${body.CurrentUser}</tem:CurrentUser>
        <tem:CaseMemberID>${caseMemberIdNum}</tem:CaseMemberID>
        <tem:MissionCode>${body.MissionCode}</tem:MissionCode>
      </tem:dataEntry>
    </tem:RetrieveMedicalRecord>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch("https://k-apiqaz.iom.int/mwebsvc/MedicalManagementService.svc", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": "\"http://tempuri.org/IMedicalManagementService/RetrieveMedicalRecord\"",
        "User-Agent": "Apache-HttpClient/4.5.5 (Java/17.0.12)",
      },
      body: soapEnvelope,
    });

    const xmlText = await response.text();

    // Parse XML to JSON
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const parsed = parser.parse(xmlText);

    // --- Find the `RetrieveMedicalRecordResult` object ---
    // The path may be different depending on namespaces. Adjust accordingly!
    // Typical path:
    // Envelope > Body > RetrieveMedicalRecordResponse > RetrieveMedicalRecordResult

    let result = null;

    try {
      // Try most common path, with or without namespace prefixes
      result =
        parsed["s:Envelope"]?.["s:Body"]?.["RetrieveMedicalRecordResponse"]?.["RetrieveMedicalRecordResult"] ||
        parsed["soap:Envelope"]?.["soap:Body"]?.["RetrieveMedicalRecordResponse"]?.["RetrieveMedicalRecordResult"] ||
        parsed["Envelope"]?.["Body"]?.["RetrieveMedicalRecordResponse"]?.["RetrieveMedicalRecordResult"];
    } catch {
      result = null;
    }

    if (!result) {
      return NextResponse.json({ error: "RetrieveMedicalRecordResult not found", debug: parsed }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}