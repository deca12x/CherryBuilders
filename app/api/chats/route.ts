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
    .or(
      `and(user_1.eq.${user_1_address},user_2.eq.${user_2_address}),and(user_1.eq.${user_2_address},user_2.eq.${user_1_address})`
    )
    .limit(1);

  if (existingChatError) throw existingChatError;

  console.log("Checking for existing chat:", existingChat);

  if (existingChat && existingChat.length > 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  try {
    // Create the chat
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .upsert([{ user_1: user_1_address, user_2: user_2_address }])
      .select();

    if (chatError) throw chatError;

    // Get the chat ID
    const chatId = chatData[0].id;

    // Check if there's an icebreaker message in the match
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("icebreaker_message")
      .or(
        `and(user_1.eq.${user_1_address},user_2.eq.${user_2_address}),and(user_1.eq.${user_2_address},user_2.eq.${user_1_address})`
      )
      .single();

    if (matchError) throw matchError;

    // If there's an icebreaker message, create the first message in the chat
    if (matchData && matchData.icebreaker_message) {
      // Determine the sender (the one who initiated the match)
      const { data: initiatorData, error: initiatorError } = await supabase
        .from("matches")
        .select("user_1")
        .or(
          `and(user_1.eq.${user_1_address},user_2.eq.${user_2_address}),and(user_1.eq.${user_2_address},user_2.eq.${user_1_address})`
        )
        .single();

      if (initiatorError) throw initiatorError;

      const sender = initiatorData.user_1;
      const receiver =
        sender === user_1_address ? user_2_address : user_1_address;

      // Create the first message
      const { error: messageError } = await supabase.from("messages").insert([
        {
          sender: sender,
          receiver: receiver,
          message: matchData.icebreaker_message,
          chat_id: chatId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (messageError) throw messageError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error creating chat in database:", error);
    return NextResponse.json(
      { error: "Error creating record in database" },
      { status: 500 }
    );
  }
}
