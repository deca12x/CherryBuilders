// app/api/events/all/route.ts
import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from("events").select("*");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No events found in database");
      return NextResponse.json({ data: [] }, { status: 200 }); // Return empty array instead of 404
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events from database:", error);
    return NextResponse.json(
      { error: "Error fetching from database" },
      { status: 500 }
    );
  }
}
