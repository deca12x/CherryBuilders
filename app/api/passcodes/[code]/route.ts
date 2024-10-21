import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase-server";

export async function GET(req: NextRequest, { params: { code } }: { params: { code: string } }) {
  if (!code) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from("passcodes").select("*").eq("code", code).single();

    if (error) {
      if (error.code === "PGRST116") {
        // No passcode found in database
        console.log("No passcode found in database");
        return NextResponse.json({ data }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
      console.log("No passcode found in database");
      return NextResponse.json({ data }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specific chat from database:", error);
    return NextResponse.json({ error: "Error fetching from database" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params: { code } }: { params: { code: string } }) {
  const { consumedValue, userAddress, eventSlug } = await req.json();

  if (!code || !consumedValue || !userAddress) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  const consumed = consumedValue === "true";

  try {
    const { error: passcodeError } = await supabase
      .from("passcodes")
      .update({
        consumed: consumed,
        user_address: userAddress,
        updated_at: new Date().toISOString(), // Update the updated_at field with UTC time
      })
      .eq("code", code);

    if (passcodeError) throw passcodeError;

    const { error: relTableError } = await supabase
      .from("users_events_rel")
      .insert([{ event_slug: eventSlug, user_address: userAddress }]);

    if (relTableError) throw relTableError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating match in database:", error);
    return NextResponse.json({ error: "Error updating record in database" }, { status: 500 });
  }
}
