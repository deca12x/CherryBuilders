import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";
// import { sendTgMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  // user_1_address is the user that initiates the match
  // user_2_address is the user that is being matched
  const { user_1_address, user_2_address } = await req.json();

  if (!user_1_address || !user_2_address) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("matches")
      .upsert([
        { user_1: user_1_address, user_2: user_2_address, matched: false },
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error inserting match in database: ", error);
    return NextResponse.json(
      { error: "Error creating record in database" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { user_1_address, user_2_address, value } = await req.json();

  if (!user_1_address || !user_2_address || !value) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("matches")
      .update({ matched: value })
      .eq("user_1", user_1_address)
      .eq("user_2", user_2_address);

    if (error) throw error;

    // Telegram notification calls
    if (value) {
      try {
        await sendTgMessage(user_1_address, user_2_address);
      } catch (telegramError) {
        console.error("Telegram notification failed:", telegramError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}
