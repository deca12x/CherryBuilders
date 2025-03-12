import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user_1_address, user_2_address } = await req.json();
  console.log("Creating chat for users:", user_1_address, user_2_address);

  if (!user_1_address || !user_2_address) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  // check if there already is a chat between the two users (in both directions)
  const { data: existingChat, error: existingChatError } = await supabase
    .from("chats")
    .select("*")
    .eq("user_1", user_1_address)
    .eq("user_2", user_2_address);

  if (existingChatError) throw existingChatError;

  console.log("Checking for existing chat:", existingChat);

  if (existingChat && existingChat.length > 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  try {
    const { error } = await supabase
      .from("chats")
      .insert([{ user_1: user_1_address, user_2: user_2_address }]);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat in database:", error);
    return NextResponse.json(
      { error: "Error creating record in database" },
      { status: 500 }
    );
  }
}
