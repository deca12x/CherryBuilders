import { supabase } from "@/lib/supabase/supabase-server";
import { UserType } from "@/lib/types";
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
  const limit = searchParams.get("limit");
  const onlyLannaHackers = searchParams.get("onlyLannaHackers");

  if (!address || !limit) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (isNaN(parseInt(limit))) {
    return NextResponse.json({ error: "Invalit limit parameter" }, { status: 400 });
  }

  try {
    const { data: matchesData, error: matchesError } = await supabase.from("matches").select("*").eq("matched", true);

    if (matchesError) {
      if (matchesError.code === "PGRST116") {
        // No matches found in database
        console.log("No matches found in database");
        return NextResponse.json({ matchesData }, { status: 404 });
      }
      throw matchesError;
    }

    if (!matchesData) {
      console.log("No matches found in database");
      return NextResponse.json({ matchesData }, { status: 404 });
    }

    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("*")
      .neq("evm_address", address)
      //.eq("ONLY_LANNA_HACKERS", onlyLannaHackers)
      .limit(parseInt(limit));

    if (userError) {
      if (userError.code === "PGRST116") {
        // No user found in database
        console.log("No user found in database");
        return NextResponse.json({ userData }, { status: 404 });
      }
      throw userError;
    }

    if (!userData) {
      console.log("No user found in database");
      return NextResponse.json({ userData }, { status: 404 });
    }

    // Get all the users that are not already matched with the given user
    const data: UserType[] = userData
      .map((user) => {
        if (
          matchesData.some(
            (match) =>
              (match.user_1 === address && match.user_2 === user.evm_address) ||
              (match.user_2 === address && match.user_1 === user.evm_address)
          )
        ) {
          return null;
        } else {
          return user;
        }
      })
      .filter((user) => user !== null);

    const shuffledData = shuffleArray(data);
    return NextResponse.json({ data: shuffledData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
