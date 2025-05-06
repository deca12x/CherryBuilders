import { getTalentScoreByWalletOrId } from "@/lib/talent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { address } = await request.json();
  const score = await getTalentScoreByWalletOrId(address!);

  if (typeof score === "number") {
    return NextResponse.json(score, { status: 200 });
  } else {
    return NextResponse.json(
      { error: "Talent score not found" },
      { status: 404 }
    );
  }
}
