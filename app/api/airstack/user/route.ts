import { fetchFarcasterProfile } from "@/lib/airstack";
import { NextRequest, NextResponse } from "next/server";

// Try catch is not needed because the fetchFarcasterProfile function already handles errors
export async function GET(req: NextRequest) {
  const address = req.headers.get("x-address")!;

  if (!address) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const userProfile = await fetchFarcasterProfile(address);

  if (!userProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: userProfile }, { status: 200 });
}
