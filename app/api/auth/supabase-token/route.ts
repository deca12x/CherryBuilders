import { verifyAuthToken } from "@/lib/privy";
import { generateSupabaseJWT } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
  }

  try {
    const privyToken = authHeader.replace("Bearer ", "");
    const { isValid, user } = await verifyAuthToken(privyToken);

    if (!isValid || !user?.wallet?.address) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const supabaseToken = await generateSupabaseJWT(user.wallet.address);
    return NextResponse.json({ token: supabaseToken });
  } catch (error) {
    console.error("Error generating Supabase token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
