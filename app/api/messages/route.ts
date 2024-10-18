import { supabaseServiceRoleClient as supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { newMessage } = await req.json();

  if (!newMessage) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("messages").insert(newMessage).select();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error creating new message in database:", error);
    return NextResponse.json({ error: "Error creating record in database" }, { status: 500 });
  }
}
