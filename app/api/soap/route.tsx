import { NextRequest, NextResponse } from 'next/server';
import soap from 'soap';

const wsdlUrl = 'http://k-apiqaz.iom.int/mwebsvc/CaseManagementService.svc?wsdl';

export async function POST(req: NextRequest) {
  const { operation, args } = await req.json();

  try {
    const client = await soap.createClientAsync(wsdlUrl);

    // Uncomment and set credentials if needed:
    // client.setSecurity(new soap.WSSecurity('username', 'password'));

    const [result] = await client[`${operation}Async`](args);

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}