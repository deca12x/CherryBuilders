import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params: { slug } }: { params: { slug: string } }) {
  if (!slug) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();

    if (error) {
      if (error.code === "PGRST116") {
        // No event found in database
        console.log("No event found in database");
        return NextResponse.json({ data }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
      console.log("No event found in database");
      return NextResponse.json({ data }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}
