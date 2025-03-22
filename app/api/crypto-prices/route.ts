import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const API_KEY = process.env.CMC_API_KEY;
  const API_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`;

  try {
    const response = await fetch(API_URL, {
      headers: { "X-CMC_PRO_API_KEY": API_KEY ?? "" },
    });

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow frontend to fetch
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
