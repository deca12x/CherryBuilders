import { getTalentPassportByWalletOrId } from "@/lib/talent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { address } = await request.json();
  const passport = await getTalentPassportByWalletOrId(address!);

  if (passport) {
    return NextResponse.json(passport.passport.score, { status: 200 });
  } else {
    return NextResponse.json({ error: "Talent passport not found" }, { status: 404 });
  }
}
