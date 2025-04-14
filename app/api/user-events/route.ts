import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase-server";

/**
 * POST: Creates a new event relationship when a user first creates their profile
 * Called by createUserEvent() in ProfileCreation.tsx during initial profile setup
 */
export async function POST(req: NextRequest) {
  const { userAddress, eventSlug } = await req.json();

  if (!userAddress || !eventSlug) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  // If "neither" selected, we're done (no relationship needed)
  if (eventSlug === "neither") {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Validate that the selected event is active
  const { data: event } = await supabase
    .from("events")
    .select("active")
    .eq("slug", eventSlug)
    .single();

  if (!event?.active) {
    return NextResponse.json(
      { error: "Selected event is not active" },
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

/**
 * PUT: Updates event selection when a user edits their profile
 * Called by updateUserEvent() in ProfileEditParent.tsx during profile editing
 */
export async function PUT(req: NextRequest) {
  const { userAddress, eventSlug } = await req.json();

  if (!userAddress || !eventSlug) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  // If "neither" selected, just delete existing relationships
  if (eventSlug === "neither") {
    try {
      const { error: deleteError } = await supabase
        .from("users_events_rel")
        .delete()
        .eq("user_address", userAddress);

      if (deleteError) throw deleteError;
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error deleting relationships:", error);
      return NextResponse.json(
        { error: "Error updating record in database" },
        { status: 500 }
      );
    }
  }

  // Validate that the selected event is active
  const { data: event } = await supabase
    .from("events")
    .select("active")
    .eq("slug", eventSlug)
    .single();

  if (!event?.active) {
    return NextResponse.json(
      { error: "Selected event is not active" },
      { status: 400 }
    );
  }

  try {
    // Delete existing relationships and create new one
    const { error: deleteError } = await supabase
      .from("users_events_rel")
      .delete()
      .eq("user_address", userAddress);

    if (deleteError) throw deleteError;

    const { error: createError } = await supabase
      .from("users_events_rel")
      .insert([{ event_slug: eventSlug, user_address: userAddress }]);

    if (createError) throw createError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}
