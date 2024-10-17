import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ param: { address } }: { param: { address: string } }) {
  if (!address) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("user_data").select("*").eq("evm_address", address).single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const { profileData } = await req.json();

  if (!profileData || !address) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("user_data")
      .upsert(
        {
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "evm_address",
        }
      )
      .eq("evm_address", address);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile in database:", error);
    return NextResponse.json({ error: "Error updating record in database" }, { status: 500 });
  }
}
