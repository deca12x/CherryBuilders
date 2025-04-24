// app/api/poap/[address]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  console.log("20poap: API route called with params:", params);

  try {
    const { address } = params;
    console.log("21poap: Processing address:", address);

    if (!address) {
      console.log("22poap: Missing address parameter");
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.POAP_API_KEY;
    console.log("23poap: POAP API Key exists:", !!apiKey);

    const apiUrl = `https://api.poap.tech/actions/scan/${address}`;
    console.log("25poap: Calling POAP API:", apiUrl);

    // Use only API key in headers
    const response = await fetch(apiUrl, {
      headers: {
        "X-API-Key": apiKey || "",
        Accept: "application/json",
      },
    });

    console.log("26poap: POAP API response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "27poap: POAPs found:",
        Array.isArray(data) ? data.length : "not an array"
      );
      return NextResponse.json(data);
    } else {
      console.log(
        "28poap: POAP API error:",
        response.status,
        response.statusText
      );
      try {
        const errorText = await response.text();
        console.log("29poap: Error response body:", errorText);
      } catch (e) {
        console.log("29poap: Could not read error response body");
      }
      return NextResponse.json(
        { error: "Failed to fetch POAPs" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("30poap: Exception in POAP API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch POAPs" },
      { status: 500 }
    );
  }
}
