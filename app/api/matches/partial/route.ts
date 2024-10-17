import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user_1_address = searchParams.get("user_1_address");
  const user_2_address = searchParams.get("user_2_address");

  if (!user_1_address || !user_2_address) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("user_2", user_2_address)
      .eq("user_1", user_1_address)
      .or("matched.is.null,matched.eq.false");

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.log("Error fetching partial match from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}
