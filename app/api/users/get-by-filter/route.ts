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
  console.log("1 start");
  // Get user's address from request headers (set by middleware)
  const address = req.headers.get("x-address")!;
  console.log("2 address");

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
    console.log(
      "3 matches:",
      matchesData?.map((m) => ({
        user_1: m.user_1,
        user_2: m.user_2,
        matched: m.matched,
      }))
    );

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
    console.log("4 matchedUsers:", Array.from(matchedUsersSet));
    const matchedUsers = Array.from(matchedUsersSet);

    // Step 3: Get users that have the required tags
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        *,
        events:users_events_rel (
          event:events(*)
        )
      `
      )
      .neq("evm_address", address) // Exclude current user
      .contains("tags", tagsArray) // Filter by tags
      .range(offset, offset + limit - 1); // Pagination
    console.log("5 userData:", userData?.length);
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
      const userEvents: string[] = user.events!.map((event) => event.slug);
      return (
        !matchedUsers.includes(user.evm_address) &&
        eventsArray.every((event) => userEvents.includes(event))
      );
    });

    if (!filteredUserData) {
      console.error("No users found with the required events");
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    // Step 6: Randomize results order
    const shuffledData = shuffleArray(filteredUserData);
    console.log("6. Final data being sent:", {
      length: shuffledData.length,
      users: shuffledData.map((u) => u.evm_address),
    });
    return NextResponse.json({ data: shuffledData }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
