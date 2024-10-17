import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user_1_address, user_2_address } = await req.json();

  if (!user_1_address || !user_2_address) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("matches")
      .upsert([{ user_1: user_1_address, user_2: user_2_address, matched: false }]);

    if (error) {
      console.error("Error inserting match in database:", error);
      return NextResponse.json({ error: "Error creating record in database" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error inserting match in database:", error);
    return NextResponse.json({ error: "Error creating record in database" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user_1_address, user_2_address, value } = await req.json();

  if (!user_1_address || !user_2_address || !value) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("matches")
      .update({ matched: value })
      .eq("user_1", user_1_address)
      .eq("user_2", user_2_address);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json({ error: "Error updating record in database" }, { status: 500 });
  }
}
