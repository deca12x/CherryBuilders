import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // user_1_address is the user that initiates the match
  // user_2_address is the user that is being matched
  const { user_1_address, user_2_address, icebreaker_message } =
    await req.json();

  console.log("POST /api/matches received:", {
    user_1_address,
    user_2_address,
    has_icebreaker: !!icebreaker_message,
    icebreaker_content: icebreaker_message,
  });

  if (!user_1_address || !user_2_address) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("matches").upsert([
      {
        user_1: user_1_address,
        user_2: user_2_address,
        matched: false,
        partial_match_date: new Date().toISOString(),
        icebreaker_message: icebreaker_message || null,
      },
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
    // First, get the existing match to preserve the icebreaker_message
    const { data: existingMatch, error: fetchError } = await supabase
      .from("matches")
      .select("icebreaker_message")
      .eq("user_1", user_1_address)
      .eq("user_2", user_2_address)
      .single();

    if (fetchError) throw fetchError;

    // Then update the match, preserving the icebreaker_message
    const { error } = await supabase
      .from("matches")
      .update({
        matched: value,
        ...(value ? { full_match_date: new Date().toISOString() } : {}),
        // Keep the existing icebreaker_message value
        icebreaker_message: existingMatch?.icebreaker_message || null,
      })
      .eq("user_1", user_1_address)
      .eq("user_2", user_2_address);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}
