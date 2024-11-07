import { supabase } from "@/lib/supabase/supabase-server";
import { UserTag, EventType } from "@/lib/supabase/types";
import { FiltersProp } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.headers.get("x-address")!;

  if (!address) {
    console.error("Missing required parameters");
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Fetch user's filters
    const { data: filtersData, error: filtersError } = await supabase
      .from("filters")
      .select("*")
      .eq("user_address", address)
      .single();

    // Fetch all the events from the database
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*");

    // If there was an error fetching the data, return the default filters
    if (eventsError || filtersError) {
      console.error("Error fetching data: ", eventsError || filtersError);
      console.error("Returning default filters");
      return NextResponse.json(
        {
          data: {
            tags: {
              "Frontend dev": false,
              "Backend dev": false,
              "Solidity dev": false,
              Designer: false,
              "Talent scout": false,
              "Business dev": false,
              Artist: false,
              "Here for the lolz": false,
            },
            events: !eventsData
              ? {}
              : eventsData.reduce(
                  (acc: FiltersProp["events"], event: EventType) => {
                    acc[event.slug] = {
                      name: event.name,
                      selected: false,
                    };
                    return acc;
                  },
                  {}
                ),
          },
        },
        { status: 200 }
      );
    }

    const tags: UserTag[] = filtersData.tags || [];
    const userEvents: string[] = filtersData.events || [];

    // Create a FiltersProp object with the fetched data
    const filters: FiltersProp = {
      tags: {
        "Frontend dev": tags.includes("Frontend dev"),
        "Backend dev": tags.includes("Backend dev"),
        "Solidity dev": tags.includes("Solidity dev"),
        Designer: tags.includes("Designer"),
        "Talent scout": tags.includes("Talent scout"),
        "Business dev": tags.includes("Business dev"),
        Artist: tags.includes("Artist"),
        "Here for the lolz": tags.includes("Here for the lolz"),
      },
      events: eventsData.reduce(
        (acc: FiltersProp["events"], event: EventType) => {
          acc[event.slug] = {
            name: event.name,
            selected: userEvents.includes(event.slug),
          };
          return acc;
        },
        {}
      ),
    };

    return NextResponse.json({ data: filters }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const address = req.headers.get("x-address")!;
  const { tags, events } = await req.json();

  if (!address || !tags || !events) {
    console.error("Missing required parameters");
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Update user's filters and if they don't exist, create them
    const { error: filtersError } = await supabase.from("filters").upsert(
      [
        {
          user_address: address,
          tags,
          events,
        },
      ],
      { onConflict: "user_address" }
    );

    if (filtersError) throw filtersError;

    return NextResponse.json(
      { message: "Filters updated succesfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
