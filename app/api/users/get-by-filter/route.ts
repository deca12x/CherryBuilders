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

    let userData;
    let userError;

    // Step 3: Get users based on filters
    if (tagsArray.length === 0 && eventsArray.length > 0) {
      // Case: No tags but has events - Query users through events relation

      // First get users who have all the required events
      let usersWithEvents = [];

      // For each event, get the users who have that event
      for (const eventSlug of eventsArray) {
        const { data: eventUsers, error: eventUsersError } = await supabase
          .from("users_events_rel")
          .select("user_address")
          .eq("event_slug", eventSlug);

        if (eventUsersError) throw eventUsersError;

        // Add these users to our list
        usersWithEvents.push(eventUsers.map((item) => item.user_address));
      }

      // Find users who appear in all event lists (intersection)
      const usersInAllEvents = usersWithEvents.reduce((acc, curr) =>
        acc.filter((user) => curr.some((item) => item === user))
      );

      // Now get the full user data for these users
      if (usersInAllEvents.length > 0) {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            *,
            events:users_events_rel (
              event:events(*)
            )
          `
          )
          .neq("evm_address", address)
          .in("evm_address", usersInAllEvents)
          .range(offset, offset + limit - 1);

        userData = data;
        userError = error;
      } else {
        userData = [];
        userError = null;
      }
    } else {
      // Case: Has tags or no filters at all - Use original query strategy
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

      // Apply tags filter with AND logic if there are tags specified
      if (tagsArray.length > 0) {
        // For AND logic, we need to check that each tag is contained in the user's tags array
        tagsArray.forEach((tag) => {
          query = query.contains("tags", [tag]);
        });
      }

      const result = await query.range(offset, offset + limit - 1); // Pagination
      userData = result.data;
      userError = result.error;

      // If we have events filter and we have users from the previous query,
      // filter the results further by events
      if (eventsArray.length > 0 && userData && userData.length > 0) {
        // Get all users who have each event
        let usersWithEvents = [];

        // For each event, get the users who have that event
        for (const eventSlug of eventsArray) {
          const { data: eventUsers, error: eventUsersError } = await supabase
            .from("users_events_rel")
            .select("user_address")
            .eq("event_slug", eventSlug);

          if (eventUsersError) throw eventUsersError;

          // Add these users to our list
          usersWithEvents.push(eventUsers.map((item) => item.user_address));
        }

        // Find users who appear in all event lists (intersection)
        const usersInAllEvents = usersWithEvents.reduce((acc, curr) =>
          acc.filter((user) => curr.some((item) => item === user))
        );

        // Filter userData to only include users who have all the required events
        userData = userData.filter((user) =>
          usersInAllEvents.includes(user.evm_address)
        );
      }
    }

    if (userError) throw userError;

    if (!userData || userData.length === 0) {
      console.error("No users found with the required filters");
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Step 4: Simplify nested event data structure
    const transformedUserData: UserType[] = userData.map((user) => ({
      ...user,
      events: user.events.map((eventRel: { event: any }) => eventRel.event),
    }));

    // Step 5: Apply final filters - Remove matched/liked users
    const filteredUserData = transformedUserData.filter((user) => {
      // Check if this is a matched user we should exclude
      if (matchedUsers.includes(user.evm_address)) {
        return false;
      }
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
