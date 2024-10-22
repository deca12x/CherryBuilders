import { validateApiKey } from "@/lib/api-key";
import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const eventSlug = "edge_city_lanna_2024";
const apiKeyExpectedOwner = "cursive";

export async function GET(req: NextRequest) {
  const userIdentifier = req.nextUrl.searchParams.get("user-identifier");

  if (!userIdentifier) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { apiKey: key, valid } = await validateApiKey(req, apiKeyExpectedOwner);

    // If the API key is invalid, return a 401
    if (!valid || !key) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // If the API key is valid, try to get the passcode for the event
    const { data: passCodeFetchData, error: passCodeFetchError } = await supabase
      .from("passcodes")
      .select("*")
      .eq("event_slug", eventSlug)
      .eq("external_identifier", userIdentifier)
      .single();

    // If there is an error fetching the passcode, throw it
    if (passCodeFetchError && passCodeFetchError.code !== "PGRST116") {
      throw passCodeFetchError;
    }

    // If the passcode already exists, return it
    if (passCodeFetchData) {
      return NextResponse.json({ passcode: passCodeFetchData.code, event_slug: eventSlug }, { status: 200 });
    }

    // If the passcode doesn't exist, create a new one
    const uuid = uuidv4();
    const { error: passcodeCreationError } = await supabase
      .from("passcodes")
      .insert([{ code: uuid, event_slug: eventSlug, consumed: false, external_identifier: userIdentifier }]);

    if (passcodeCreationError) {
      throw passcodeCreationError;
    }

    return NextResponse.json({ passcode: uuid, event_slug: eventSlug }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
