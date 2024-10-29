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
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const tags = searchParams.get("tags");
  const events = searchParams.get("events");

  if (!address) {
    console.error("Missing required parameters");
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    console.error("Invalid pagination parameters");
    return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
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

    // First get total count for pagination
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .neq("evm_address", address)
      .contains("tags", tagsArray);

    if (countError) throw countError;

    const totalPages = Math.ceil((count || 0) / pageSize);
    const offset = (page - 1) * pageSize;

    // Fetch paginated users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        *,
        events:users_events_rel (
          event:events(*)
        )
      `)
      .neq("evm_address", address)
      .contains("tags", tagsArray)
      .range(offset, offset + pageSize - 1);

    if (userError) throw userError;

    if (!userData) {
      return NextResponse.json({ 
        data: { users: [], totalPages: 0 } 
      }, { status: 404 });
    }

    // Transform and filter data as before
    const transformedUserData: UserType[] = userData.map((user) => ({
      ...user,
      events: user.events.map((eventRel: { event: any }) => eventRel.event),
    }));

    const filteredUserData = transformedUserData.filter((user) => {
      const userEvents: string[] = user.events!.map((event) => event.slug);
      return !matchedUsers.includes(user.evm_address) && eventsArray.every((event) => userEvents.includes(event));
    });

    // Shuffle the filtered data
    const shuffledData = shuffleArray(filteredUserData);

    return NextResponse.json({ 
      data: { 
        users: shuffledData, 
        totalPages 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
