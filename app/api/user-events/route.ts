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

  // If "none" selected, we're done (no relationship needed)
  if (eventSlug === "none") {
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
  const { userAddress, selectedEvents } = await req.json();

  if (!userAddress || !Array.isArray(selectedEvents)) {
    return NextResponse.json(
      { error: "Incorrect payload format" },
      { status: 400 }
    );
  }

  // If no events selected, delete all relationships
  if (selectedEvents.length === 0) {
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

  try {
    // Get current events for the user
    const { data: currentEvents, error: fetchError } = await supabase
      .from("users_events_rel")
      .select("event_slug")
      .eq("user_address", userAddress);

    if (fetchError) throw fetchError;

    const currentEventSlugs = currentEvents?.map((e) => e.event_slug) || [];

    // Validate that all selected events are active
    const { data: activeEvents, error: activeError } = await supabase
      .from("events")
      .select("slug")
      .in("slug", selectedEvents)
      .eq("active", true);

    if (activeError) throw activeError;

    const activeEventSlugs = activeEvents?.map((e) => e.slug) || [];
    const invalidEvents = selectedEvents.filter(
      (slug) => !activeEventSlugs.includes(slug)
    );

    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          error: `Selected events are not active: ${invalidEvents.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Remove events that are no longer selected
    const eventsToRemove = currentEventSlugs.filter(
      (slug) => !selectedEvents.includes(slug)
    );
    if (eventsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("users_events_rel")
        .delete()
        .eq("user_address", userAddress)
        .in("event_slug", eventsToRemove);

      if (deleteError) throw deleteError;
    }

    // Add new events that weren't previously selected
    const eventsToAdd = selectedEvents.filter(
      (slug) => !currentEventSlugs.includes(slug)
    );
    if (eventsToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from("users_events_rel")
        .insert(
          eventsToAdd.map((slug) => ({
            event_slug: slug,
            user_address: userAddress,
          }))
        );

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating events in database:", error);
    return NextResponse.json(
      { error: "Error updating record in database" },
      { status: 500 }
    );
  }
}
