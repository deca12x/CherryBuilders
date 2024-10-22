import { supabase } from "@/lib/supabase/supabase-server";
import { UserType } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

function shuffleArray(array: UserType[]): UserType[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(req: NextRequest) {
  const address = req.headers.get("x-address")!;

  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  const tags = searchParams.get("tags");
  const events = searchParams.get("events");

  if (!address) {
    console.error("Missing required parameters");
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (isNaN(limit) || isNaN(offset)) {
    console.error("Invalid limit or offset parameter");
    return NextResponse.json({ error: "Invalid limit or offset parameter" }, { status: 400 });
  }

  try {
    const tagsArray = tags ? tags.split(",") : [];
    const eventsArray = events ? events.split(",") : [];

    // Fetch matched users first
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("user_1, user_2, matched")
      .or(`user_1.eq.${address},user_2.eq.${address}`);

    if (matchesError) throw matchesError;

    const matchedUsersSet = new Set(
      matchesData
        ? matchesData
            .filter((match) => match.matched || match.user_1 === address)
            .flatMap((match) => [match.user_1, match.user_2])
            .filter((user) => user !== address)
        : []
    );

    const matchedUsers = Array.from(matchedUsersSet);

    // Fetch users that have the required tags
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
      .neq("evm_address", address)
      .contains("tags", tagsArray)
      .range(offset, offset + limit - 1);

    if (userError) throw userError;

    if (!userData) {
      console.error("No users found with the required tags");
      return NextResponse.json({ data: userData }, { status: 404 });
    }

    // Unnest the event objects
    const transformedUserData: UserType[] = userData.map((user) => ({
      ...user,
      events: user.events.map((eventRel: { event: any }) => eventRel.event),
    }));

    // Remove all the users that have their addresses contained in the matchedUsers array
    // and doesn't have the required events
    const filteredUserData = transformedUserData.filter((user) => {
      const userEvents: string[] = user.events!.map((event) => event.slug);
      return !matchedUsers.includes(user.evm_address) && eventsArray.every((event) => userEvents.includes(event));
    });

    if (!filteredUserData) {
      console.error("No users found with the required events");
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    // Shuffle the array
    const shuffledData = shuffleArray(filteredUserData);
    return NextResponse.json({ data: shuffledData }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
