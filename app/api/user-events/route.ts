import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase-server";
import { getCurrentEventSlugs, isCurrentEvent } from "@/lib/supabase/eventData";

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

  // Validate that the selected event is either "neither" or one of the current events
  if (eventSlug !== "neither" && !isCurrentEvent(eventSlug)) {
    return NextResponse.json(
      { error: "Invalid event selection" },
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
 *
 * Process:
 * 1. Deletes all current event relationships for the user
 * 2. If "neither" is selected, just returns (no new relationship created)
 * 3. Otherwise, creates a new relationship with the selected event
 */
export async function PUT(req: NextRequest) {
  const { userAddress, eventSlug } = await req.json();

  if (!userAddress || !eventSlug) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  // Validate that the selected event is either "neither" or one of the current events
  if (eventSlug !== "neither" && !isCurrentEvent(eventSlug)) {
    return NextResponse.json(
      { error: "Invalid event selection" },
      { status: 400 }
    );
  }

  try {
    // First delete any existing relationships for current events
    const { error: relTableDeleteError } = await supabase
      .from("users_events_rel")
      .delete()
      .eq("user_address", userAddress)
      .in("event_slug", getCurrentEventSlugs());

    if (relTableDeleteError) throw relTableDeleteError;

    // If "neither" selected, we're done (no new relationship needed)
    if (eventSlug === "neither") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Create new relationship with selected event
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
