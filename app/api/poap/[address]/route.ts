import { getUserPoaps } from "@/lib/poap";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    console.log("POAP API route called with address:", address);

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const poaps = await getUserPoaps(address);
    console.log(
      "POAP API response:",
      poaps ? `${poaps.length} POAPs found` : "No POAPs found"
    );

    return NextResponse.json(poaps, { status: 200 });
  } catch (error) {
    console.error("Error in POAP API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch POAPs" },
      { status: 500 }
    );
  }
}
