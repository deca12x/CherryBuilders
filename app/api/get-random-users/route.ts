import { supabase } from "@/lib/supabase";
import { UserType } from "@/lib/types";
import { NextResponse } from "next/server";

function shuffleArray(array: UserType[]): UserType[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("user_data").select("*").limit(15);

    if (error) {
      return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
    }

    const shuffledData = shuffleArray(data);
    return NextResponse.json(shuffledData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
