import { supabase } from "@/lib/supabase/supabase-server";
import { UserType } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

// Helper function to randomize array order
function shuffleArray(array: UserType[]): UserType[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(req: NextRequest) {
  // Get user's address from request headers (set by middleware)
  const address = req.headers.get("x-address")!;

  // Get pagination and filter params from URL
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  const tags = searchParams.get("tags");
  const events = searchParams.get("events");

  // Validate required parameters
  if (!address) {
    console.error("Missing required parameters");
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  if (isNaN(limit) || isNaN(offset)) {
    console.error("Invalid limit or offset parameter");
    return NextResponse.json(
      { error: "Invalid limit or offset parameter" },
      { status: 400 }
    );
  }

  try {
    // Convert comma-separated strings to arrays
    const tagsArray = tags ? tags.split(",") : [];
    const eventsArray = events ? events.split(",") : [];

    // Step 1: Get all matches involving current user
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("user_1, user_2, matched")
      .or(`user_1.eq.${address},user_2.eq.${address}`);

    if (matchesError) throw matchesError;

    // Step 2: Create list of users to exclude (already matched or liked)
    const matchedUsersSet = new Set(
      matchesData
        ? matchesData
            // Keep complete matches and where current user initiated
            .filter((match) => match.matched || match.user_1 === address)
            // Get both users from each match
            .flatMap((match) => [match.user_1, match.user_2])
            // Remove current user from list
            .filter((user) => user !== address)
        : []
    );
    const matchedUsers = Array.from(matchedUsersSet);

    // Step 3: Get users that have the required tags
    let query = supabase
      .from("users")
      .select(
        `
        *,
        events:users_events_rel (
          event:events(*)
        )
      `
      )
      .neq("evm_address", address); // Exclude current user

    // Only apply tags filter if there are tags specified
    if (tagsArray.length > 0) {
      query = query.overlaps("tags", tagsArray);
    }

    const { data: userData, error: userError } = await query.range(
      offset,
      offset + limit - 1
    ); // Pagination
    if (userError) throw userError;

    if (!userData) {
      console.error("No users found with the required tags");
      return NextResponse.json({ data: userData }, { status: 404 });
    }

    // Step 4: Simplify nested event data structure
    const transformedUserData: UserType[] = userData.map((user) => ({
      ...user,
      events: user.events.map((eventRel: { event: any }) => eventRel.event),
    }));

    // Step 5: Apply final filters
    // - Remove matched/liked users
    // - Ensure users have all required events
    const filteredUserData = transformedUserData.filter((user) => {
      // First check if this is a matched user we should exclude
      if (matchedUsers.includes(user.evm_address)) {
        return false;
      }

      // If we have events to filter by, check them
      if (eventsArray.length > 0) {
        const userEvents: string[] = user.events!.map((event) => event.slug);

        // Check if user has all required events
        const hasAllEvents = eventsArray.every((event) =>
          userEvents.includes(event)
        );
        if (!hasAllEvents) {
          return false;
        }
      }

      // User passed all filters
      return true;
    });

    if (filteredUserData.length === 0) {
      console.error("No users found with the required filters");
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Step 6: Randomize results order
    const shuffledData = shuffleArray(filteredUserData);
    return NextResponse.json({ data: shuffledData }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
