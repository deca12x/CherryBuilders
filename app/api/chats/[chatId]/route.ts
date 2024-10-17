import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET({ param: { chatId } }: { param: { chatId: string } }) {
  if (!chatId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("chats").select("*").eq("id", chatId).single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specific chat from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}
