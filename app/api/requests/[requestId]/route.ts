import { supabase } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params: { requestId } }: { params: { requestId: string } }) {
  const { paid } = await req.json();

  if (!paid || !requestId) {
    return NextResponse.json({ error: "Incorrect payload format" }, { status: 400 });
  }

  const isPaid = paid === "true";

  try {
    const { error } = await supabase.from("messages").update({ paid: isPaid }).eq("requestId", requestId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating request message in database:", error);
    return NextResponse.json({ error: "Error updating record in database" }, { status: 500 });
  }
}
