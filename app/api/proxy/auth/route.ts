import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {

  const targetUrl = `https://iom-ppo-directus-dev.iom.int/users/me`;

  try {
    const res = await fetch(targetUrl);
    const data = await res.json();
    console.log("Response:", data);
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Proxy error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
