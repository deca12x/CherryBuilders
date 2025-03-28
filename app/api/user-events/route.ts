import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase-server";

export async function POST(req: NextRequest) {
  const { userAddress, eventSlug } = await req.json();

  if (!userAddress || !eventSlug) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  try {
    const { error: relTableError } = await supabase
      .from("users_events_rel")
      .insert([{ event_slug: eventSlug, user_address: userAddress }]);

    if (relTableError) throw relTableError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userAddress, eventSlug } = await req.json();

  if (!userAddress || !eventSlug) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  try {
    // delete every existing record in db for current user, where event_slug is current eventSlug
    const { error: relTableDeleteError } = await supabase
      .from("users_events_rel")
      .delete()
      .eq("user_address", userAddress)
      .in("event_slug", ["aleph_march_2025", "eth_warsaw_spring_2025"]);

    if (relTableDeleteError) throw relTableDeleteError;

    if (eventSlug === "neither") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // create new record
    const { error: relTableCreateError } = await supabase
      .from("users_events_rel")
      .insert([{ event_slug: eventSlug, user_address: userAddress }]);

    if (relTableCreateError) throw relTableCreateError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}
