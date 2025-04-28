// app/api/poap/[address]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.POAP_API_KEY;
    const apiUrl = `https://api.poap.tech/actions/scan/${address}`;

    // Use only API key in headers
    const response = await fetch(apiUrl, {
      headers: {
        "X-API-Key": apiKey || "",
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      try {
        const errorText = await response.text();
      } catch (e) {
        console.log("29poap: Could not read error response body");
      }
      return NextResponse.json(
        { error: "Failed to fetch POAPs" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch POAPs" },
      { status: 500 }
    );
  }
}
