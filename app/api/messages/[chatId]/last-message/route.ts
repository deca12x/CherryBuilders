import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params: { chatId } }: { params: { chatId: string } }) {
  if (!chatId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      if (error.code === "PGRST116") {
        // No message found in database for this chat
        console.log("No message found in database for this chat");
        return NextResponse.json({ data }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
      console.log("No message found in database for this chat");
      return NextResponse.json({ data }, { status: 404 });
    }

    return NextResponse.json({ data: data[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specific chat from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}
