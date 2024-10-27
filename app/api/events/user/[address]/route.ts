import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  if (!address) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Fetch the events the user is attending
    const { data: userEvents, error: userEventsError } = await supabase
      .from("users_events_rel")
      .select("event_slug")
      .eq("user_address", address);

    if (userEventsError) throw userEventsError;

    if (!userEvents || userEvents.length === 0) {
      console.log("No events found for this user in database");
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    // Fetch detailed information about each event
    const eventSlugs = userEvents.map((rel) => rel.event_slug);
    const { data: events, error: eventsError } = await supabase.from("events").select("*").in("slug", eventSlugs);

    if (eventsError) throw eventsError;

    return NextResponse.json({ data: events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}
