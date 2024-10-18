import { supabaseServiceRoleClient as supabase } from "@/lib/supabase";
import { UserType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function shuffleArray(array: UserType[]): UserType[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST(req: NextRequest) {
  try {
    // Get the user's address from the request body
    const { address } = await req.json();

    const { data: matchesData, error: matchesError } = await supabase.from("matches").select("*").eq("matched", true);

    if (matchesError) {
      return NextResponse.json({ error: "Error fetching matches" }, { status: 500 });
    }

    const { data: userData, error: userError } = await supabase
      .from("user_data")
      .select("*")
      .neq("evm_address", address)
      .eq("ONLY_LANNA_HACKERS", true);

    if (userError) {
      return NextResponse.json({ error: "Error fetching users", details: userError }, { status: 500 });
    }

    console.log("Total users fetched:", userData.length);
    console.log("Fetched user data:", userData);

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

    const shuffledData = shuffleArray(userData);
    return NextResponse.json(shuffledData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
