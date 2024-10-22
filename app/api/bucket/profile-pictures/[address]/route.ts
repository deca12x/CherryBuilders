import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const formData = await req.formData();
  const fileName = formData.get("fileName") as string;
  const file = formData.get("file") as File;

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
