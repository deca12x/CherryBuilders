import { supabaseServiceRoleClient as supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { address, value } = await request.json();

  if (!address || value === undefined) {
    return NextResponse.json({ error: "Address and value are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("user_data").update({ ONLY_LANNA_HACKERS: value }).eq("evm_address", address);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
