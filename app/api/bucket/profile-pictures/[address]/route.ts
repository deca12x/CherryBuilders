import { supabaseServiceRoleClient as supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const { fileName, file } = await req.json();

  if (!address || !fileName || !file) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  try {
    const { error } = await supabase.storage.from("profile-pictures").upload(`${address}/${fileName}`, file);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error uploading profile picture in database: ", error);
    return NextResponse.json({ error: "Error uploading file in database" }, { status: 500 });
  }
}
