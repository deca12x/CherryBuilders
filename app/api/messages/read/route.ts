import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { chatId, readValue } = await req.json();

  if (!chatId || readValue === undefined) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Update all the messages' (of the corresponding chat Id) read values inside the database
    const { data, error } = await supabase.from("messages").update({ read: readValue }).eq("chat_id", chatId);

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error updating messages in database:", error);
    return NextResponse.json({ error: "Error updating record in database" }, { status: 500 });
  }
}
